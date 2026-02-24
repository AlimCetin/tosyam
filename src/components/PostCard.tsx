import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { Post } from '../types';
import { SOCKET_URL } from '../constants/config';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { CustomActionSheet, ActionSheetOption } from './CustomActionSheet';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';

interface Props {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onProfilePress: (userId: string) => void;
  isVisible?: boolean;
}

export const PostCard: React.FC<Props> = ({
  post,
  onLike,
  onComment,
  onSave,
  onShare,
  onProfilePress,
  isVisible = false,
}) => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
  const user = post.user || { username: 'Unknown', avatar: null, fullName: 'Unknown' };
  const userId = typeof post.userId === 'string' ? post.userId : ((post.userId as any)?._id?.toString() || (post.userId as any)?.toString() || '');

  const [isPaused, setIsPaused] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isVisible || !isFocused) {
      setIsPaused(true);
    }
  }, [isVisible, isFocused]);

  const getVideoUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('file:') || url.startsWith('content:') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${SOCKET_URL}${url}`;
    }
    return url;
  };

  const videoUrl = getVideoUrl(typeof post.video === 'string' ? post.video : '');

  const handleBlockUser = async () => {
    Alert.alert(
      'Kullanıcıyı Engelle',
      `${user.username || (user as any).fullName} kullanıcısını engellemek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.blockUser(userId);
              showToast('Kullanıcı engellendi', 'success');
            } catch (error: any) {
              showToast(error.response?.data?.message || 'Engelleme başarısız oldu', 'error');
            }
          }
        }
      ]
    );
  };

  const actionSheetOptions: ActionSheetOption[] = [
    {
      label: 'Kullanıcıyı Engelle',
      onPress: handleBlockUser
    },
    {
      label: 'Şikayet Et',
      destructive: true,
      onPress: () => navigation.navigate('ReportUser', {
        reportedId: post.id,
        type: 'post'
      })
    }
  ];

  return (
    <View style={styles.container}>
      <CustomActionSheet
        isVisible={isActionSheetVisible}
        onClose={() => setIsActionSheetVisible(false)}
        options={actionSheetOptions}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onProfilePress(userId)}>
          <Image
            source={{ uri: user.avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user.username || (user as any).fullName || 'Unknown'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setIsActionSheetVisible(true)}>
          <Icon name="ellipsis-horizontal" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      {post.video ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsPaused(!isPaused)}
          style={styles.videoContainer}>
          <View pointerEvents="none" style={styles.image}>
            <Video
              source={{ uri: videoUrl }}
              style={[{ width: '100%', height: '100%' }]}
              resizeMode="cover"
              paused={isPaused}
              repeat
              muted={false}
              controls={false}
            />
          </View>
          {isPaused && (
            <View style={styles.playIconContainer} pointerEvents="none">
              <Icon name="play-circle" size={64} color="rgba(255, 255, 255, 0.8)" />
            </View>
          )}
        </TouchableOpacity>
      ) : post.image ? (
        <Image source={{ uri: post.image }} style={styles.image} />
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => {
              if (post.id) {
                onLike(post.id);
              } else {
                console.error('❌ Post ID bulunamadı:', post);
              }
            }}
            activeOpacity={0.7}>
            <Icon
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={post.isLiked ? '#FF1744' : '#424242'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onComment(post.id)}>
            <Icon name="chatbubbles-outline" size={27} color="#424242" />
          </TouchableOpacity>
          {onShare && (
            <TouchableOpacity onPress={() => onShare(post.id)}>
              <Icon name="arrow-redo-outline" size={27} color="#424242" />
            </TouchableOpacity>
          )}
        </View>
        {onSave && (
          <TouchableOpacity onPress={() => onSave(post.id)}>
            <Icon
              name={post.isSaved ? 'ribbon' : 'ribbon-outline'}
              size={27}
              color={post.isSaved ? '#9C27B0' : '#424242'}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.likes}>{post.likeCount || 0} beğeni</Text>
        <View style={styles.caption}>
          <Text style={styles.username}>{user.username || (user as any).fullName || 'Unknown'} </Text>
          <Text style={styles.captionText}>{post.caption || ''}</Text>
        </View>
        {(post.commentCount || 0) > 0 && (
          <TouchableOpacity onPress={() => onComment(post.id)}>
            <Text style={styles.comments}>
              {post.commentCount} yorumun tamamını gör
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    padding: 4,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
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
  captionText: {
    flex: 1,
    fontSize: 14,
  },
  comments: {
    color: '#8e8e8e',
    marginTop: 4,
    fontSize: 14,
  },
  videoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
