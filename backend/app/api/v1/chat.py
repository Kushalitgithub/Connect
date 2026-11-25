"""
Chat endpoints: threads and messages for tourist-guide messaging.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from jose import JWTError, jwt

from app.db.session import get_db
from app.models.user import User, RoleEnum
from app.models.chat_thread import ChatThread
from app.models.message import Message
from app.core.dependencies import get_current_user_any
from app.core.security import decode_token

router = APIRouter()


@router.get("/threads", status_code=status.HTTP_200_OK)
def get_chat_threads(
    current_user: User = Depends(get_current_user_any),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get chat threads for the current user (tourist or guide).
    """
    query = db.query(ChatThread).filter(
        (ChatThread.tourist_id == current_user.id) |
        (ChatThread.guide_id == current_user.id)
    )
    threads = query.order_by(ChatThread.updated_at.desc()).offset(skip).limit(limit).all()
    return threads


@router.post("/threads", status_code=status.HTTP_201_CREATED)
def create_chat_thread(
    guide_id: int,
    booking_id: Optional[int] = None,
    current_user: User = Depends(get_current_user_any),
    db: Session = Depends(get_db)
):
    """
    Create a chat thread between a tourist and a guide.
    Tourists can create threads with any guide; guides can create threads with tourists.
    """
    if current_user.role == RoleEnum.tourist:
        tourist_id = current_user.id
        guide_id_param = guide_id
    elif current_user.role == RoleEnum.guide:
        guide_id_param = current_user.id
        tourist_id = guide_id  # the other party is the tourist
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot create chat threads",
        )

    # Verify the other party exists
    other_user = db.query(User).filter(User.id == (guide_id_param if current_user.role == RoleEnum.tourist else tourist_id)).first()
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Reuse existing thread if one exists for this pair
    existing = db.query(ChatThread).filter(
        ChatThread.tourist_id == tourist_id,
        ChatThread.guide_id == guide_id_param,
    ).first()
    if existing:
        return existing

    thread = ChatThread(
        tourist_id=tourist_id,
        guide_id=guide_id_param,
        booking_id=booking_id,
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread


@router.post("/threads/{thread_id}/messages", status_code=status.HTTP_201_CREATED)
def create_message(
    thread_id: int,
    body: str,
    current_user: User = Depends(get_current_user_any),
    db: Session = Depends(get_db)
):
    """
    Send a message in a thread. Only participants can post.
    """
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    if current_user.id not in (thread.tourist_id, thread.guide_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant of this thread",
        )

    message = Message(
        thread_id=thread_id,
        sender_id=current_user.id,
        body=body,
    )
    db.add(message)
    thread.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(message)

    return message


@router.get("/threads/{thread_id}/messages", status_code=status.HTTP_200_OK)
def get_thread_messages(
    thread_id: int,
    current_user: User = Depends(get_current_user_any),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Get messages in a thread. Only participants can read.
    """
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found",
        )

    if current_user.id not in (thread.tourist_id, thread.guide_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant of this thread",
        )

    messages = db.query(Message).filter(
        Message.thread_id == thread_id
    ).order_by(Message.sent_at.asc()).offset(skip).limit(limit).all()
    return messages


# Connection manager for WebSocket chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        conns = self.active_connections.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: str):
        for ws in list(self.active_connections.get(user_id, [])):
            try:
                await ws.send_text(message)
            except Exception:
                self.disconnect(user_id, ws)


manager = ConnectionManager()


@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    """
    WebSocket chat endpoint. Re-authenticates via JWT query param (?token=...),
    verifies thread participation on every connect, and relays messages in real time.
    Supports auto-reconnect on the client side.
    """
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    try:
        payload = decode_token(token)
        user_id = payload.get("user_id")
        if user_id is None:
            await websocket.close(code=4001)
            return
    except JWTError:
        await websocket.close(code=4001)
        return

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Expected JSON: {"thread_id": int, "body": str}
            import json
            try:
                msg = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "invalid_json"}))
                continue

            thread_id = msg.get("thread_id")
            body = msg.get("body")
            if not thread_id or not body:
                await websocket.send_text(json.dumps({"error": "thread_id and body required"}))
                continue

            # Verify participation
            thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
            if not thread or user_id not in (thread.tourist_id, thread.guide_id):
                await websocket.send_text(json.dumps({"error": "not a participant"}))
                continue

            message = Message(
                thread_id=thread_id,
                sender_id=user_id,
                body=body,
            )
            db.add(message)
            thread.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(message)

            # Broadcast to both participants
            payload_out = json.dumps({
                "id": message.id,
                "thread_id": thread_id,
                "sender_id": user_id,
                "body": body,
                "sent_at": message.sent_at.isoformat() if message.sent_at else None,
            })
            await manager.send_to_user(thread.tourist_id, payload_out)
            await manager.send_to_user(thread.guide_id, payload_out)
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
