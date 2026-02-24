import React, { useState, useEffect, useRef } from 'react';

import {
  View,
  FlatList,
  TextInput,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { messageService } from '../services/messageService';
import { Message } from '../types';
import { authService } from '../services/authService';
import { SOCKET_URL } from '../constants/config';
import { Storage as AppStorage } from '../utils/storage';
import { DeviceEventEmitter } from 'react-native';
import io from 'socket.io-client';

export const ChatScreen: React.FC = () => {
  const route = useRoute<any>();
  const headerHeight = useHeaderHeight();
  const { conversationId, receiverId } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const currentUserRef = useRef<any>(null);

  // Mevcut kullanıcıyı bir kez al
  useEffect(() => {
    currentUserRef.current = authService.getCurrentUser();
  }, []);

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
      loadMessages(conversationId);
    } else if (receiverId) {
      findOrCreateConversation();
    }
    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId, receiverId]);

  // Klavye yüksekliğini dinle
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        const h = e?.endCoordinates?.height ?? 0;
        if (Platform.OS === 'android') {
          setKeyboardHeight(h);
          setIsKeyboardVisible(true);
        }

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        if (Platform.OS === 'android') {
          setKeyboardHeight(0);
          setIsKeyboardVisible(false);
        }
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const initSocket = () => {
    const token = AppStorage.getString('token');
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('💬 Chat Socket Connected');
    });

    socketRef.current.on('connect_error', async (err: any) => {
      console.log('❌ Chat Socket Connection Error:', err.message);
      if (err.message === 'jwt expired') {
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          const newToken = AppStorage.getString('token');
          if (newToken) {
            DeviceEventEmitter.emit('token-refreshed', { token: newToken });
          }
        }
      }
    });

    socketRef.current.on('newMessage', (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id || m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
  };

  useEffect(() => {
    const tokenListener = DeviceEventEmitter.addListener('token-refreshed', () => {
      console.log('🔄 Chat Socket: Token yenilendi, yeniden bağlanılıyor...');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      initSocket();
    });

    return () => {
      tokenListener.remove();
    };
  }, []);

  const findOrCreateConversation = async () => {
    try {
      console.log('🔍 Conversation aranıyor, receiverId:', receiverId);
      const response = await messageService.getConversations();
      const conversations = response.conversations || [];

      const existingConversation = conversations.find((conv: any) =>
        conv.participants.some((p: any) => {
          const participantId = typeof p === 'object' ? p._id || p.id : p;
          return participantId === receiverId;
        })
      );

      if (existingConversation) {
        const conv = existingConversation as any;
        console.log('✅ Mevcut conversation bulundu:', conv._id || conv.id);
        const convId = conv._id || conv.id;
        setActiveConversationId(convId);
        loadMessages(convId);
      } else {
        console.log('⚠️ Conversation bulunamadı, yeni mesaj gönderildiğinde oluşturulacak');
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Conversation bulunamadı:', error);
      setMessages([]);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      console.log('📥 Mesajlar yükleniyor, conversationId:', convId);
      const response = await messageService.getMessages(convId);
      const messagesData = response.messages || response;

      const normalizedMessages = Array.isArray(messagesData) ? messagesData.map((msg: any) => ({
        id: msg._id || msg.id,
        _id: msg._id || msg.id,
        conversationId: msg.conversationId || convId,
        senderId: String(msg.senderId || ''),
        receiverId: String(msg.receiverId || ''),
        text: msg.text || '',
        read: msg.read || false,
        createdAt: msg.createdAt,
        sender: msg.sender,
      })) : [];

      setMessages(normalizedMessages);
      console.log('✅ Mesajlar yüklendi:', normalizedMessages.length);

      await markMessagesAsRead(convId);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('❌ Mesajlar yüklenemedi:', error);
    }
  };

  const markMessagesAsRead = async (convId: string) => {
    try {
      await messageService.markAsRead(convId);
      console.log('✅ Mesajlar okundu olarak işaretlendi');
    } catch (error) {
      console.error('❌ Mesajlar okundu işaretlenemedi:', error);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      console.log('📤 Mesaj gönderiliyor...', { receiverId, activeConversationId });

      let targetReceiverId = receiverId;
      const currentUser = currentUserRef.current as any;
      const currentUserId = currentUser?._id || currentUser?.id;

      if (!targetReceiverId && messages.length > 0) {
        const firstMessage = messages[0];
        const messageSenderId = firstMessage.senderId || (firstMessage.sender as any)?.id;
        targetReceiverId = messageSenderId === currentUserId
          ? firstMessage.receiverId
          : messageSenderId;
      }

      if (targetReceiverId) {
        const response: any = await messageService.sendMessage(targetReceiverId, text);
        console.log('✅ Mesaj gönderildi:', response);

        const currentUserIdString = String(currentUserId || '');

        const formattedMessage: Message = {
          id: response._id?.toString() || response.id?.toString() || '',
          _id: response._id?.toString() || response.id?.toString() || '',
          conversationId: response.conversationId || activeConversationId || '',
          senderId: response.senderId || currentUserIdString,
          receiverId: response.receiverId || targetReceiverId,
          text: response.text || text,
          read: response.read || false,
          createdAt: response.createdAt || new Date().toISOString(),
          sender: response.sender || {
            id: currentUserIdString,
            fullName: currentUser?.fullName || '',
            username: currentUser?.fullName || '',
            avatar: currentUser?.avatar || null,
          },
        };

        setMessages((prev) => [...prev, formattedMessage]);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        if (!activeConversationId && response.conversationId) {
          console.log('✅ Yeni conversation oluşturuldu:', response.conversationId);
          setActiveConversationId(response.conversationId);
        }
      }

      setText('');
    } catch (error) {
      console.error('❌ Mesaj gönderilemedi:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // currentUserRef kullanarak performans iyileştirmesi
    const currentUser = currentUserRef.current;
    const currentUserIdRaw = (currentUser as any)?._id || (currentUser as any)?.id;
    const currentUserId = currentUserIdRaw ? String(currentUserIdRaw).trim() : '';

    let senderIdRaw: any = null;
    if (item.senderId) {
      senderIdRaw = item.senderId;
    } else if (item.sender) {
      const senderObj = item.sender as any;
      senderIdRaw = senderObj?.id || senderObj?._id;
    }

    const senderId = senderIdRaw ? String(senderIdRaw).trim() : '';
    const isMe = currentUserId !== '' && senderId !== '' && currentUserId === senderId;
    const senderAvatar = (item.sender as any)?.avatar || 'https://via.placeholder.com/40';

    return (
      <View style={[styles.messageContainer, isMe && styles.myMessage]}>
        {!isMe && (
          <Image
            source={{ uri: senderAvatar }}
            style={styles.messageAvatar}
          />
        )}
        <View style={[styles.bubble, isMe && styles.myBubble]}>
          <Text style={[styles.messageText, isMe && styles.myMessageText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // Input container yüksekliği (gerçek yükseklik)
  const inputContainerHeight = Platform.OS === 'ios' ? 64 : 68;


  const safeEdges =
    Platform.OS === 'ios'
      ? (['top', 'bottom'] as const)
      : (isKeyboardVisible ? (['top'] as const) : (['top', 'bottom'] as const));

  return (
    <SafeAreaView style={styles.safeArea} edges={safeEdges}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        enabled={Platform.OS === 'ios'}
      >
        {/* Android'de prediction bar dahil klavye yüksekliği kadar alt padding */}
        <View style={[styles.container, Platform.OS === 'android' && { paddingBottom: keyboardHeight }]}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id || item._id || `message-${index}-${item.createdAt}`}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: inputContainerHeight + 10 }
            ]}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 80);
              }
            }}
            keyboardShouldPersistTaps="handled"
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Mesaj yaz..."
                placeholderTextColor="#999"
                value={text}
                onChangeText={setText}
                multiline
                onFocus={() => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
                disabled={!text.trim()}
              >
                <Icon
                  name={text.trim() ? "send" : "send-outline"}
                  size={24}
                  color={text.trim() ? "#2f8dda" : "#999"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ece5dd'

  },
  container: {
    flex: 1,
    backgroundColor: '#ece5dd',
  },
  flatList: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  myMessage: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 6,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myBubble: {
    backgroundColor: '#dcf8c6',
  },
  messageText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#000',
  },
  inputContainer: {
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 2 : 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
});
