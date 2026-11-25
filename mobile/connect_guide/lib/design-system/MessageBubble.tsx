import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { colors, radii } from './tokens';

interface MessageBubbleProps {
  text: string;
  isSentByMe: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  isSentByMe,
  style
}) => {
  const bgColor = isSentByMe ? colors.primary : colors.surfaceAlt;
  const textColor = isSentByMe ? colors.surface : colors.textPrimary;
  const alignSelf = isSentByMe ? 'flex-end' : 'flex-start';

  return (
    <View
      style={[
        {
          maxWidth: '80%',
          borderRadius: parseInt(radii.lg),
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginVertical: 4,
          backgroundColor: bgColor,
          alignSelf,
        },
        style
      ]}
    >
      <Text style={{ color: textColor }}>{text}</Text>
    </View>
  );
};
