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
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Ekrana girildiğinde bildirimleri yeniden yükle
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      const notificationsData = response.notifications || response; // Backward compatibility
      
      console.log('📥 Yüklenen bildirimler:', notificationsData.length);
      console.log('📥 İlk 3 bildirim:', JSON.stringify(notificationsData.slice(0, 3), null, 2));
      
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      case 'message':
        return 'mail';
      default:
        return 'notifications';
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    console.log('📱 Bildirime tıklandı:', JSON.stringify(notification, null, 2));
    console.log('🔍 PostId tipi:', typeof notification.postId, 'Değer:', notification.postId);

    // Bildirimi okundu işaretle (sadece tıklanan bildirim)
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        // Local state'i güncelle
        setNotifications(prevNotifications =>
          prevNotifications.map(item =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );
      } catch (error) {
        console.error('Bildirim okundu işaretlenemedi:', error);
      }
    }

    switch (notification.type) {
      case 'like':
      case 'comment':
        // Post beğeni veya yorum -> Post detayına git
        if (notification.postId) {
          let postId: string;
          
          // Güvenli string dönüşümü
          if (typeof notification.postId === 'string') {
            postId = notification.postId;
            console.log('✅ PostId zaten string:', postId);
          } else if (typeof notification.postId === 'object' && notification.postId !== null) {
            const postObj = notification.postId as any;
            postId = postObj?.id || postObj?._id || postObj?.toString() || '';
            console.warn('⚠️ PostId obje idi, dönüştürüldü:', postId);
            console.warn('⚠️ Obje içeriği:', JSON.stringify(postObj));
          } else {
            postId = String(notification.postId);
            console.warn('⚠️ PostId beklenmeyen tipte:', typeof notification.postId);
          }
          
          // Final validation
          if (postId && postId !== '[object Object]' && postId !== 'undefined' && postId !== 'null' && postId.length > 0) {
            console.log('✅ Navigate to PostDetail with postId:', postId);
            navigation.navigate('PostDetail', { postId: postId });
          } else {
            console.error('❌ HATA: Geçersiz PostId!');
            console.error('❌ PostId değeri:', postId);
            console.error('❌ Notification:', JSON.stringify(notification));
          }
        } else {
          console.error('❌ PostId yok veya null!');
          console.error('❌ Notification:', JSON.stringify(notification));
        }
        break;

      case 'follow':
        // Takip bildirimi -> Kullanıcı profiline git
        if (notification.fromUser?.id) {
          navigation.navigate('Profile', { userId: notification.fromUser.id });
        }
        break;

      case 'message':
        // Mesaj bildirimi -> Direkt chat ekranına git
        if (notification.fromUser?.id) {
          console.log('💬 Mesaj göndericisine gidiliyor:', notification.fromUser.id);
          navigation.navigate('Chat', { 
            receiverId: notification.fromUser.id,
            receiverName: notification.fromUser.username || notification.fromUser.fullName,
            receiverAvatar: notification.fromUser.avatar
          });
        }
        break;

      default:
        console.log('⚠️ Bilinmeyen bildirim tipi:', notification.type);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const fromUser = item.fromUser || { 
      id: '', 
      username: 'Unknown', 
      fullName: 'Unknown', 
      avatar: null 
    };
    
    return (
      <TouchableOpacity 
        style={[styles.item, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}>
        <Image
          source={{
            uri: fromUser.avatar || 'https://via.placeholder.com/50',
          }}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <Text style={styles.text}>
            <Text style={styles.username}>
              {fromUser.username || fromUser.fullName || 'Unknown'}
            </Text>{' '}
            {item.type === 'like' && 'gönderini beğendi'}
            {item.type === 'comment' && 'gönderine yorum yaptı'}
            {item.type === 'follow' && 'seni takip etmeye başladı'}
            {item.type === 'message' && 'sana mesaj gönderdi'}
          </Text>
          <Text style={styles.time}>{item.createdAt}</Text>
        </View>
        <Icon
          name={getIcon(item.type)}
          size={24}
          color={item.read ? '#8e8e8e' : '#0095f6'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Bildirim yok</Text>
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
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  unreadItem: {
    backgroundColor: '#f0f8ff',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
  },
  username: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8e8e8e',
  },
});
