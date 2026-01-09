import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { messageService } from '../services/messageService';
import { Conversation } from '../types';
import { authService } from '../services/authService';

export const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  // Ekrana her girildiğinde conversation'ları yenile (unread count güncellenmesi için)
  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    try {
      const response = await messageService.getConversations();
      const conversationsData = response.conversations || response; // Backward compatibility
      console.log('📥 Yüklenen conversations:', conversationsData.length);
      console.log('📥 İlk conversation:', JSON.stringify(conversationsData[0], null, 2));
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
    } catch (error) {
      console.error('Konuşmalar yüklenemedi:', error);
    }
  };

  const handleConversationPress = async (conversationId: string, receiverId?: string) => {
    // Conversation'a tıklandığında mesajları okundu işaretle (sadece bu conversation için)
    try {
      await messageService.markAsRead(conversationId);
      console.log('✅ Conversation mesajları okundu olarak işaretlendi:', conversationId);
      
      // Local state'i güncelle (unreadCount'u azalt)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId || conv._id === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('❌ Mesajlar okundu işaretlenemedi:', error);
    }
    
    navigation.navigate('Chat', { conversationId, receiverId });
  };

  const getOtherUser = (participants: any[]) => {
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser?._id || currentUser?.id;
    
    if (!currentUserId || !participants || participants.length === 0) {
      return null;
    }
    
    // Mevcut kullanıcıyı bul ve diğer kullanıcıyı döndür
    const otherUser = participants.find((p: any) => {
      const participantId = p.id || p._id || p;
      return participantId !== currentUserId;
    });
    
    return otherUser || participants[0]; // Eğer bulunamazsa ilkini döndür
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dk`;
    if (hours < 24) return `${hours} sa`;
    if (days < 7) return `${days} gün`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => {
          const otherUser = getOtherUser(item.participants);
          
          if (!otherUser) {
            return null; // Geçersiz conversation
          }
          
          const otherUserId = otherUser.id || otherUser._id || otherUser;
          const otherUserName = otherUser.fullName || otherUser.username || 'Kullanıcı';
          const otherUserAvatar = otherUser.avatar || 'https://via.placeholder.com/60';
          
          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleConversationPress(item.id || item._id, otherUserId)}>
              <Image
                source={{ uri: otherUserAvatar }}
                style={styles.avatar}
              />
              <View style={styles.content}>
                <View style={styles.row}>
                  <Text style={styles.username}>{otherUserName}</Text>
                  <Text style={styles.time}>{formatTime(item.updatedAt || item.lastMessageAt)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.message} numberOfLines={1}>
                    {item.lastMessage?.text || 'Mesaj yok'}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz mesaj yok</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  message: {
    fontSize: 14,
    color: '#8e8e8e',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#0095f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8e8e8e',
  },
});
