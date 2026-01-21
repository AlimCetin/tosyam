import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { postService } from '../services/postService';
import { authService } from '../services/authService';
import { Post } from '../types';
import { SOCKET_URL } from '../constants/config';

// Video URL'ini çözümle (relative path ise full URL yap)
const getVideoUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('file:') || url.startsWith('content:') || url.startsWith('data:')) {
    return url;
  }
  // Relative path ise base URL ekle
  if (url.startsWith('/')) {
    return `${SOCKET_URL}${url}`;
  }
  return url;
};

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [isOwnPost, setIsOwnPost] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  // Ekrana her dönüldüğünde gönderiyi yeniden yükle
  useFocusEffect(
    React.useCallback(() => {
      loadPost();
    }, [postId])
  );

  const loadPost = async () => {
    try {
      const postData = await postService.getPostById(postId);

      // Check if this is own post
      const currentUser = authService.getCurrentUser() as any;

      // Current user ID - try both _id and id
      let currentUserId = '';
      if (currentUser) {
        currentUserId = String(currentUser._id || currentUser.id || '');
      }

      // Post userId - backend sends both userId and user.id
      let postUserId = '';
      if (postData) {
        postUserId = String(
          postData.userId ||
          (postData as any).user?.id ||
          (postData as any).user?._id ||
          ''
        );
      }

      // Both must exist and match
      const isOwn = Boolean(currentUserId && postUserId && currentUserId === postUserId);

      console.log('🔍 DETAILED Ownership check:', {
        currentUser_id: currentUser?._id,
        currentUser_id_type: typeof currentUser?._id,
        currentUser_id_value: currentUser?.id,
        currentUserId_final: currentUserId,
        postData_userId: postData.userId,
        postData_userId_type: typeof postData.userId,
        postData_user_id: (postData as any).user?.id,
        postUserId_final: postUserId,
        isOwn,
        comparison: `"${currentUserId}" === "${postUserId}"`,
      });

      setPost(postData);
      setIsOwnPost(isOwn);
    } catch (error: any) {
      console.error('Gönderi yüklenemedi:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        setPost(null);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Gönderiyi Sil',
      'Bu gönderiyi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await postService.deletePost(postId);
              Alert.alert('Başarılı', 'Gönderi silindi', [
                { text: 'Tamam', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Gönderi silme hatası:', error);
              Alert.alert('Hata', 'Gönderi silinemedi');
            }
          },
        },
      ]
    );
  };

  const handleHide = async () => {
    try {
      if (post?.isHidden) {
        await postService.updateVisibility(postId, { isHidden: false });
        Alert.alert('Başarılı', 'Gönderi gösterildi');
      } else {
        await postService.updateVisibility(postId, { isHidden: true });
        Alert.alert('Başarılı', 'Gönderi gizlendi');
      }
      loadPost();
    } catch (error) {
      console.error('Gönderi gizleme hatası:', error);
      Alert.alert('Hata', 'Gönderi gizlenemedi');
    }
  };

  const handleVisibilityOptions = () => {
    console.log('📤 PostDetailScreen -> SelectHiddenFollowers:', {
      postId,
      initialHidden: post?.hiddenFromFollowers || [],
      initialIsPrivate: post?.isPrivate || false,
      mode: 'post_visibility'
    });

    navigation.navigate('SelectHiddenFollowers', {
      postId,
      initialHidden: post?.hiddenFromFollowers || [],
      initialIsPrivate: post?.isPrivate || false,
      mode: 'post_visibility'
    });
  };

  if (!post) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Gönderi bulunamadı veya görüntülenemiyor</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Own post - simplified UI */}
      {isOwnPost ? (
        <View style={styles.ownPostContainer}>
          {post.video ? (
            <Video source={{ uri: getVideoUrl(post.video as string) }} style={styles.image} resizeMode="contain" controls />
          ) : post.image ? (
            <Image source={{ uri: post.image }} style={styles.image} />
          ) : null}

          <TouchableOpacity
            style={styles.likesRow}
            onPress={() => navigation.navigate('LikesList', { postId })}>
            <Text style={styles.likesText}>{post.likeCount || 0} beğeni</Text>
          </TouchableOpacity>

          <View style={styles.ownPostActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Comments', { postId })}>
              <Icon name="chatbubbles-outline" size={24} color="#424242" />
              <Text style={styles.actionText}>
                {post.commentCount || 0} Yorum
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVisibilityOptions}>
              <Icon
                name={post.isPrivate ? 'lock-closed-outline' : 'earth-outline'}
                size={24}
                color="#000"
              />
              <Text style={styles.actionText}>
                {post.isPrivate
                  ? (post.hiddenFromFollowers && post.hiddenFromFollowers.length > 0
                    ? `Takipçiler (${post.hiddenFromFollowers.length} hariç)`
                    : 'Takipçiler')
                  : 'Herkese Açık'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}>
              <Icon name="trash-outline" size={24} color="#ff3040" />
              <Text style={[styles.actionText, styles.deleteText]}>Sil</Text>
            </TouchableOpacity>
          </View>

          {post.caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.captionText}>{post.caption}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.commentsButton}
            onPress={() => navigation.navigate('Comments', { postId })}>
            <Text style={styles.commentsButtonText}>
              {(post.commentCount || 0) > 0
                ? `${post.commentCount} yorumun tamamını gör`
                : 'Yorum yap'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Other user's post - full UI
        <View style={styles.postContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => {
                // Profile ekranına giderken, eğer navigation stack'inde zaten Profile varsa
                // ona dönüp params'ı güncelle, yeni ekran açma
                const routes = navigation.getState()?.routes;
                const profileRouteIndex = routes?.findIndex((r: any) => r.name === 'Profile');

                if (profileRouteIndex !== undefined && profileRouteIndex >= 0) {
                  // Stack'te Profile var, ona dön ve params'ı güncelle
                  navigation.navigate({
                    name: 'Profile',
                    params: { userId: post.userId },
                    merge: true,
                  } as never);
                } else {
                  // Stack'te Profile yok, normal navigate
                  navigation.navigate('Profile', { userId: post.userId });
                }
              }}>
              <Image
                source={{ uri: post.user?.avatar || 'https://via.placeholder.com/40' }}
                style={styles.avatar}
              />
              <Text style={styles.username}>
                {post.user?.username || post.user?.fullName || 'Unknown'}
              </Text>
            </TouchableOpacity>
          </View>

          {post.video ? (
            <Video source={{ uri: getVideoUrl(post.video as string) }} style={styles.image} resizeMode="contain" controls />
          ) : post.image ? (
            <Image source={{ uri: post.image }} style={styles.image} />
          ) : null}

          <View style={styles.actions}>
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    if (post.isLiked) {
                      await postService.unlikePost(postId);
                    } else {
                      await postService.likePost(postId);
                    }
                    loadPost();
                  } catch (error) {
                    console.error('Beğeni hatası:', error);
                  }
                }}
                activeOpacity={0.7}>
                <Icon
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={28}
                  color={post.isLiked ? '#FF1744' : '#424242'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId })}>
                <Icon name="chatbubbles-outline" size={27} color="#424242" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={async () => {
                try {
                  if (post.isSaved) {
                    await postService.unsavePost(postId);
                  } else {
                    await postService.savePost(postId);
                  }
                  loadPost();
                } catch (error) {
                  console.error('Kaydetme hatası:', error);
                }
              }}>
              <Icon
                name={post.isSaved ? 'ribbon' : 'ribbon-outline'}
                size={27}
                color={post.isSaved ? '#9C27B0' : '#424242'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('LikesList', { postId })}>
              <Text style={styles.likes}>{post.likeCount || 0} beğeni</Text>
            </TouchableOpacity>
            <View style={styles.caption}>
              <Text style={styles.username}>
                {post.user?.username || post.user?.fullName || 'Unknown'}{' '}
              </Text>
              <Text style={styles.captionText}>{post.caption || ''}</Text>
            </View>
            {(post.commentCount || 0) > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Comments', { postId })}>
                <Text style={styles.comments}>
                  {post.commentCount} yorumun tamamını gör
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
  },
  ownPostContainer: {
    backgroundColor: '#fff',
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  likesRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  ownPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#000',
  },
  deleteButton: {
    // Delete button styling
  },
  deleteText: {
    color: '#ff3040',
  },
  footer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  likes: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  caption: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  captionText: {
    flex: 1,
    fontSize: 14,
  },
  comments: {
    color: '#8e8e8e',
    marginTop: 4,
    fontSize: 14,
  },
  commentsButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsButtonText: {
    fontSize: 14,
    color: '#0095f6',
    fontWeight: '600',
    textAlign: 'center',
  },
});
