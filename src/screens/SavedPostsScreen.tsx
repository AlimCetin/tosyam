import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { PostCard } from '../components/PostCard';
import { postService } from '../services/postService';
import { Post, User } from '../types';

export const SavedPostsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadSavedPosts();
    }, [])
  );

  const loadSavedPosts = async () => {
    console.log('🔄 Kaydedilen postlar yükleniyor...');
    setLoading(true);
    try {
      const response = await postService.getSavedPosts();
      const postsData = response.posts || response;
      console.log('✅ Kaydedilen postlar yüklendi, post sayısı:', postsData?.length || 0);
      setPosts(postsData || []);
    } catch (error) {
      console.error('❌ Kaydedilen postlar yüklenemedi:', error);
      Alert.alert('Hata', 'Kaydedilen postlar yüklenemedi');
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

    // Optimistic update
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !wasLiked,
              likeCount: wasLiked ? (p.likeCount || 0) - 1 : (p.likeCount || 0) + 1,
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
      
      // Hata durumunda geri al
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: wasLiked,
                likeCount: wasLiked ? (p.likeCount || 0) + 1 : (p.likeCount || 0) - 1,
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

    // Optimistic update - Remove from list since we're unsaving
    if (wasSaved) {
      setPosts(posts.filter((p) => p.id !== postId));
    }

    try {
      if (wasSaved) {
        console.log('👎 Unsave işlemi başlatılıyor...');
        await postService.unsavePost(postId);
        console.log('✅ Unsave başarılı');
      } else {
        console.log('👍 Save işlemi başlatılıyor...');
        await postService.savePost(postId);
        console.log('✅ Save başarılı');
        // Reload to update the list
        loadSavedPosts();
      }
    } catch (error: any) {
      console.error('❌ Kaydet hatası:', error);
      console.error('❌ Hata detayı:', error.response?.data || error.message);
      
      // Hata durumunda geri al
      if (wasSaved) {
        loadSavedPosts();
      }
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

      if (post.image || post.video) {
        const mediaData = post.image || post.video;
        let filePath = '';
        let shouldCleanup = false;
        
        if (mediaData && mediaData.startsWith('data:')) {
          const base64Data = mediaData.split(',')[1];
          const mimeType = mediaData.split(';')[0].split(':')[1];
          const extension = mimeType.split('/')[1];
          
          const fileName = `share_${Date.now()}.${extension}`;
          filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
          
          await RNFS.writeFile(filePath, base64Data, 'base64');
          shouldCleanup = true;
          
          console.log('✅ Base64 dosyaya yazıldı:', filePath);
        } else if (mediaData && (mediaData.startsWith('http://') || mediaData.startsWith('https://'))) {
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
          filePath = mediaData || '';
        }
        
        const shareOptions: any = {
          title: 'Paylaş',
          message: shareMessage,
          url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
          type: post.video ? 'video/mp4' : 'image/jpeg',
          subject: shareMessage,
        };

        await Share.open(shareOptions);
        console.log('✅ Gönderi paylaşıldı');
        
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
          }, 2000);
        }
        
      } else {
        await Share.open({
          title: 'Gönderiyi Paylaş',
          message: shareMessage,
          subject: 'Gönderiyi Paylaş',
        });
        console.log('✅ Gönderi paylaşıldı');
      }
    } catch (error: any) {
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onComment={handleComment}
            onSave={handleSave}
            onShare={handleShare}
            onProfilePress={handleProfilePress}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadSavedPosts} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Icon name="bookmark-outline" size={64} color="#8e8e8e" />
              <Text style={styles.emptyText}>Kaydedilen gönderi yok</Text>
              <Text style={styles.emptySubtext}>
                Beğendiğiniz gönderileri kaydederek daha sonra kolayca bulabilirsiniz
              </Text>
            </View>
          ) : null
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e8e',
    textAlign: 'center',
    lineHeight: 20,
  },
});

