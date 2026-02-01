import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, fonts } from '../../constants';

const MOCK_MESSAGES = [
  { id: '1', sender: 'owner', text: 'Chào em, phòng vẫn còn nhé.' },
  { id: '2', sender: 'student', text: 'Dạ em muốn đặt lịch chiều mai 2h được không ạ?' },
  { id: '3', sender: 'owner', text: 'Chiều mai 2h hợp lý, anh sẽ có mặt.' },
];

export default function ChatDetailScreen({ route }) {
  const conversation = route?.params?.conversation || {
    room: 'Phòng mini Q10',
    owner: 'Anh Tâm',
  };
  const [messages] = useState(MOCK_MESSAGES);
  const [text, setText] = useState('');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.room}>{conversation.room}</Text>
        <Text style={styles.owner}>Chủ trọ: {conversation.owner}</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === 'student' ? styles.bubbleStudent : styles.bubbleOwner]}>
            <Text style={[styles.bubbleText, item.sender === 'student' && styles.bubbleTextStudent]}>
              {item.text}
            </Text>
            <Text style={styles.timestamp}>2 phút trước</Text>
          </View>
        )}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={colors.textLight}
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendText}>Gửi</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.helper}>* Layout chat chi tiết. Realtime sẽ được kết nối bằng Socket.io sau.</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.screenPadding,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  room: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semiBold,
  },
  owner: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.screenPadding,
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
  },
  bubbleStudent: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleOwner: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    color: colors.text,
  },
  bubbleTextStudent: {
    color: colors.white,
  },
  timestamp: {
    marginTop: spacing.xs,
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius,
  },
  sendText: {
    color: colors.white,
    fontWeight: fonts.weights.semiBold,
  },
  helper: {
    textAlign: 'center',
    padding: spacing.sm,
    color: colors.textLight,
    fontSize: fonts.sizes.sm,
  },
});
