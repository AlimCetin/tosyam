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
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { messageService } from '../services/messageService';
import { Message } from '../types';
import { authService } from '../services/authService';
import { SOCKET_URL } from '../constants/config';
import io from 'socket.io-client';

export const ChatScreen: React.FC = () => {
  const route = useRoute<any>();
  const { conversationId, receiverId } = route.params || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<any>(null);
  const debugLogged = useRef(false);

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
      loadMessages(conversationId);
    } else if (receiverId) {
      // Bildirimlerden geldiğinde receiverId ile conversation bul
      findOrCreateConversation();
    }
    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [conversationId, receiverId]);

  // Ekrana her girildiğinde ve mesajlar yüklendiğinde okundu işaretle
  useFocusEffect(
    React.useCallback(() => {
      if (activeConversationId) {
        markMessagesAsRead(activeConversationId);
      }
    }, [activeConversationId])
  );

  const initSocket = () => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      // Yeni mesaj geldiğinde en alta scroll et
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
  };

  const findOrCreateConversation = async () => {
    try {
      console.log('🔍 Conversation aranıyor, receiverId:', receiverId);
      // Tüm conversations'ları al ve receiverId ile eşleşeni bul
      const response = await messageService.getConversations();
      const conversations = response.conversations || [];
      
      const existingConversation = conversations.find((conv: any) => 
        conv.participants.some((p: any) => {
          const participantId = typeof p === 'object' ? p._id || p.id : p;
          return participantId === receiverId;
        })
      );

      if (existingConversation) {
        console.log('✅ Mevcut conversation bulundu:', existingConversation._id || existingConversation.id);
        const convId = existingConversation._id || existingConversation.id;
        setActiveConversationId(convId);
        loadMessages(convId);
      } else {
        console.log('⚠️ Conversation bulunamadı, yeni mesaj gönderildiğinde oluşturulacak');
        // Conversation yok, yeni mesaj gönderildiğinde oluşturulacak
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
      const messagesData = response.messages || response; // Backward compatibility
      // Backend'den zaten chronological order'da geliyor (en eski en üstte, en yeni en altta)
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      console.log('✅ Mesajlar yüklendi:', messagesData.length);
      
      // Mesajlar yüklendikten sonra okundu işaretle
      await markMessagesAsRead(convId);
      
      // Mesajlar yüklendikten sonra en alta scroll et
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
      
      // Eğer receiverId direkt yoksa ve mesajlar varsa, karşı tarafın ID'sini bul
      if (!targetReceiverId && messages.length > 0) {
        const currentUser = authService.getCurrentUser();
        const currentUserId = currentUser?._id || currentUser?.id;
        const firstMessage = messages[0];
        // Mesajın göndereni mevcut kullanıcıysa, alıcı diğer taraftır
        const messageSenderId = firstMessage.senderId || (firstMessage.sender as any)?.id;
        targetReceiverId = messageSenderId === currentUserId 
          ? firstMessage.receiverId 
          : messageSenderId;
      }
      
      if (targetReceiverId) {
        const response = await messageService.sendMessage(targetReceiverId, text);
        console.log('✅ Mesaj gönderildi:', response);
        
        // Response'u formatla - backend'den gelen formatı normalize et
        const currentUser = authService.getCurrentUser();
        const currentUserId = String(currentUser?._id || currentUser?.id || '');
        
        const formattedMessage: Message = {
          id: response._id?.toString() || response.id?.toString() || '',
          _id: response._id?.toString() || response.id?.toString() || '',
          conversationId: response.conversationId || activeConversationId || '',
          senderId: currentUserId, // Kendi ID'mizi kullan
          receiverId: targetReceiverId,
          text: response.text || text,
          read: response.read || false,
          createdAt: response.createdAt || new Date().toISOString(),
          sender: response.sender || {
            id: currentUserId,
            fullName: currentUser?.fullName || '',
            username: currentUser?.fullName || '',
            avatar: currentUser?.avatar || null,
          },
        };
        
        // Yeni mesajı listeye ekle
        setMessages((prev) => [...prev, formattedMessage]);
        
        // Yeni mesaj gönderildikten sonra en alta scroll et
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        // Eğer ilk mesajsa ve conversation yoksa, yeni conversation oluşturuldu demektir
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
    const currentUser = authService.getCurrentUser();
    // currentUserId'yi normalize et - hem _id hem id kontrolü yap
    const currentUserIdRaw = currentUser?._id || currentUser?.id;
    const currentUserId = currentUserIdRaw ? String(currentUserIdRaw).trim() : '';
    
    // senderId'yi normalize et - hem senderId hem sender.id kontrolü yap
    let senderIdRaw: any = null;
    if (item.senderId) {
      senderIdRaw = item.senderId;
    } else if (item.sender) {
      const senderObj = item.sender as any;
      senderIdRaw = senderObj?.id || senderObj?._id;
    }
    
    const senderId = senderIdRaw ? String(senderIdRaw).trim() : '';
    
    // String karşılaştırması yap (case-insensitive olmadan)
    const isMe = currentUserId !== '' && senderId !== '' && currentUserId === senderId;
    
    const senderAvatar = (item.sender as any)?.avatar || 'https://via.placeholder.com/30';
    
    // Debug - sadece ilk render'da log at
    if (!debugLogged.current) {
      console.log('🔍 Mesaj render debug:', {
        currentUserId,
        senderId,
        isMe,
        currentUserIdRaw,
        senderIdRaw,
        itemSenderId: item.senderId,
        itemSender: item.sender,
        currentUser,
      });
      debugLogged.current = true;
    }

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        // inverted kaldırıldı - en eski üstte, en yeni altta gösterilecek
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mesaj yaz..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity onPress={sendMessage}>
          <Icon name="send" size={24} color="#0095f6" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    padding: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessage: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
  },
  bubble: {
    maxWidth: '70%',
    backgroundColor: '#f0f0f0',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  myBubble: {
    backgroundColor: '#0095f6',
  },
  messageText: {
    fontSize: 14,
    color: '#000',
  },
  myMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
});
