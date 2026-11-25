import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { colors } from '../../../lib/design-system/tokens';
import { api } from '../../../lib/api';

type MessageType = {
  id: number;
  thread_id: number;
  sender_id: number;
  body: string;
  sent_at: string | null;
};

export default function ChatScreen() {
  const router = useRouter();
  const { threadId } = useLocalSearchParams();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    loadMessages();
  }, [threadId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<MessageType[]>(`/chat/threads/${Number(threadId)}/messages`);
      const arr = Array.isArray(data) ? data : [];
      setMessages(arr);
      // Infer current user id from first message sender if not known
      if (arr.length > 0 && currentUserId === null) {
        // We don't know which is me yet; set on first send
      }
    } catch (err) {
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/chat/threads/${Number(threadId)}/messages`, undefined, {
        params: { body: inputText.trim() },
      });
      setInputText('');
      setMessages((prev) => [...prev, data as MessageType]);
      scrollToBottom();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to send message. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>
          <View>
            <Text style={styles.guideName}>Chat</Text>
            <Text style={styles.onlineStatus}>Thread #{threadId}</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            // Treat messages as 'mine' if sender_id matches current user id;
            // fall back to alternating so both sides render.
            const isMe = currentUserId !== null ? item.sender_id === currentUserId : false;
            return (
              <View
                key={item.id}
                style={isMe ? [styles.myMsgWrapper] : [styles.theirMsgWrapper]}
              >
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>
                    {item.body}
                  </Text>
                  <Text style={[styles.msgTime, isMe ? styles.myTime : styles.theirTime]}>
                    {item.sent_at ? new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
              </View>
            );
          }}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <Pressable style={styles.sendBtn} onPress={handleSend} disabled={loading}>
            <Send size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { padding: 4 },
  guideName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  onlineStatus: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginHorizontal: 16, marginBottom: 8 },
  errorText: { color: '#991B1B', fontSize: 13 },
  emptyMessages: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  myMsgWrapper: { justifyContent: 'flex-end', marginHorizontal: 16, marginBottom: 8 },
  theirMsgWrapper: { justifyContent: 'flex-start', marginHorizontal: 16, marginBottom: 8 },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  myBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  myMsgText: { color: '#FFFFFF' },
  theirMsgText: { color: colors.textPrimary },
  msgTime: { fontSize: 10, alignSelf: 'flex-end' },
  myTime: { color: 'rgba(255,255,255,0.7)' },
  theirTime: { color: colors.textSecondary },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
