import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Text,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { PostCard } from '../components/PostCard';
import { AdCard } from '../components/AdCard';
import { postService } from '../services/postService';
import { notificationService } from '../services/notificationService';
import { messageService } from '../services/messageService';
import { Post, User } from '../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    loadFeed();
  }, []);

  // Ekrana her dönüldüğünde okunmamış bildirim ve mesaj sayısını yükle
  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCounts();
    }, [])
  );

  const loadUnreadCounts = async () => {
    try {
      // Bildirim sayısını yükle
      const notificationCount = await notificationService.getUnreadCount();
      setUnreadNotifications(notificationCount);
      
      // Mesaj sayısını yükle
      const messageCount = await messageService.getUnreadCount();
      setUnreadMessages(messageCount);
    } catch (error) {
      console.error('Okunmamış sayılar yüklenemedi:', error);
    }
  };

  const loadFeed = async () => {
    console.log('🔄 Feed yükleniyor...');
    setLoading(true);
    try {
      const response = await postService.getFeed();
      const postsData = response.posts || response; // Backward compatibility
      console.log('✅ Feed yüklendi, post sayısı:', postsData?.length || 0);
      setPosts(postsData || []);
    } catch (error) {
      console.error('❌ Feed yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    console.log('❤️ Beğeni butonuna tıklandı, postId:', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post) {
      console.error('❌ Post bulunamadı:', postId);
      return;
    }

    const wasLiked = post.isLiked;
    console.log('📊 Mevcut durum - isLiked:', wasLiked, 'likeCount:', post.likeCount);

    // Optimistic update - hemen UI'ı güncelle
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !wasLiked,
              likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      )
    );

    try {
      if (wasLiked) {
        console.log('👎 Unlike işlemi başlatılıyor...');
        await postService.unlikePost(postId);
        console.log('✅ Unlike başarılı');
      } else {
        console.log('👍 Like işlemi başlatılıyor...');
        await postService.likePost(postId);
        console.log('✅ Like başarılı');
      }
    } catch (error: any) {
      console.error('❌ Beğeni hatası:', error);
      console.error('❌ Hata detayı:', error.response?.data || error.message);
      
      // Hata durumunda geri al (rollback)
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: wasLiked,
                likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1,
              }
            : p
        )
      );
    }
  };

  const handleSave = async (postId: string) => {
    console.log('💾 Kaydet butonuna tıklandı, postId:', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post) {
      console.error('❌ Post bulunamadı:', postId);
      return;
    }

    const wasSaved = post.isSaved || false;
    console.log('📊 Mevcut durum - isSaved:', wasSaved);

    // Optimistic update
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isSaved: !wasSaved,
            }
          : p
      )
    );

    try {
      if (wasSaved) {
        console.log('👎 Unsave işlemi başlatılıyor...');
        await postService.unsavePost(postId);
        console.log('✅ Unsave başarılı');
      } else {
        console.log('👍 Save işlemi başlatılıyor...');
        await postService.savePost(postId);
        console.log('✅ Save başarılı');
      }
    } catch (error: any) {
      console.error('❌ Kaydet hatası:', error);
      console.error('❌ Hata detayı:', error.response?.data || error.message);
      
      // Hata durumunda geri al
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isSaved: wasSaved,
              }
            : p
        )
      );
    }
  };

  const handleShare = async (postId: string) => {
    console.log('📤 Paylaş butonuna tıklandı, postId:', postId);
    const post = posts.find((p) => p.id === postId);
    if (!post) {
      console.error('❌ Post bulunamadı:', postId);
      return;
    }

    try {
      const username = post.user?.username || post.user?.fullName || 'Kullanıcı';
      const shareMessage = post.caption 
        ? `${username} bir gönderi paylaştı: ${post.caption}`
        : `${username} bir gönderi paylaştı`;

      // Eğer görüntü veya video varsa, dosya olarak paylaş
      if (post.image || post.video) {
        const mediaData = post.image || post.video;
        let filePath = '';
        let shouldCleanup = false;
        
        // Base64 string'i kontrol et ve işle
        if (mediaData && mediaData.startsWith('data:')) {
          // Base64 formatından dosya tipini ve data'yı ayır
          const base64Data = mediaData.split(',')[1];
          const mimeType = mediaData.split(';')[0].split(':')[1];
          const extension = mimeType.split('/')[1];
          
          // Geçici dosya oluştur
          const fileName = `share_${Date.now()}.${extension}`;
          filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
          
          // Base64'ü dosyaya yaz
          await RNFS.writeFile(filePath, base64Data, 'base64');
          shouldCleanup = true;
          
          console.log('✅ Base64 dosyaya yazıldı:', filePath);
        } else if (mediaData && (mediaData.startsWith('http://') || mediaData.startsWith('https://'))) {
          // HTTP/HTTPS URL'si ise indir
          const extension = mediaData.includes('.mp4') || post.video ? 'mp4' : 'jpg';
          const fileName = `share_${Date.now()}.${extension}`;
          filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
          
          console.log('📥 URL indiriliyor:', mediaData);
          const downloadResult = await RNFS.downloadFile({
            fromUrl: mediaData,
            toFile: filePath,
          }).promise;
          
          if (downloadResult.statusCode !== 200) {
            throw new Error('Görsel indirilemedi');
          }
          
          shouldCleanup = true;
          console.log('✅ URL indirildi:', filePath);
        } else {
          // Yerel dosya yolu
          filePath = mediaData || '';
        }
        
        // Paylaşım seçenekleri - sistem menüsü direkt açılır
        const shareOptions: any = {
          title: 'Paylaş',
          message: shareMessage,
          url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
          type: post.video ? 'video/mp4' : 'image/jpeg',
          subject: shareMessage,
        };

        // Sistem paylaşım menüsünü aç (tüm uygulamalar görünür)
        await Share.open(shareOptions);
        console.log('✅ Gönderi paylaşıldı');
        
        // Paylaşım tamamlandıktan sonra geçici dosyayı temizle
        if (shouldCleanup) {
          setTimeout(async () => {
            try {
              const exists = await RNFS.exists(filePath);
              if (exists) {
                await RNFS.unlink(filePath);
                console.log('✅ Geçici dosya silindi:', filePath);
              }
            } catch (cleanupError) {
              console.warn('⚠️ Geçici dosya silinemedi:', cleanupError);
            }
          }, 2000); // 2 saniye bekle
        }
        
      } else {
        // Sadece metin paylaş
        await Share.open({
          title: 'Gönderiyi Paylaş',
          message: shareMessage,
          subject: 'Gönderiyi Paylaş',
        });
        console.log('✅ Gönderi paylaşıldı');
      }
    } catch (error: any) {
      // Kullanıcı paylaşımı iptal ettiyse sessizce geç
      if (error.message === 'User did not share' || error.message.includes('cancel')) {
        console.log('❌ Paylaşım iptal edildi');
        return;
      }
      console.error('❌ Paylaşım hatası:', error);
      Alert.alert('Hata', 'Gönderi paylaşılamadı');
    }
  };

  const handleComment = (postId: string) => {
    navigation.navigate('Comments', { postId });
  };

  const handleProfilePress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleMessagePress = () => {
    navigation.navigate('Messages');
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={handleSearchPress}
          activeOpacity={0.7}>
          <Icon name="search-outline" size={24} color="#757575" />
          <View style={styles.searchPlaceholder}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ara"
              placeholderTextColor="#8e8e8e"
              editable={false}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationPress}>
            <Icon name="notifications-circle-outline" size={28} color="#424242" />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleMessagePress}>
            <Icon name="mail-outline" size={28} color="#424242" />
            {unreadMessages > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'ad') {
            return <AdCard ad={item} />;
          }
          return (
            <PostCard
              post={item}
              onLike={handleLike}
              onComment={handleComment}
              onSave={handleSave}
              onShare={handleShare}
              onProfilePress={handleProfilePress}
            />
          );
        }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadFeed} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
    height: 36,
  },
  searchPlaceholder: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff3040',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
