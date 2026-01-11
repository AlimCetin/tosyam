import React from 'react';
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

interface Props {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onProfilePress: (userId: string) => void;
}

export const PostCard: React.FC<Props> = ({
  post,
  onLike,
  onComment,
  onSave,
  onShare,
  onProfilePress,
}) => {
  const user = post.user || { username: 'Unknown', avatar: null };
  const userId = typeof post.userId === 'string' ? post.userId : (post.userId?._id?.toString() || post.userId?.toString() || '');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onProfilePress(userId)}>
          <Image
            source={{ uri: user.avatar || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user.username || user.fullName || 'Unknown'}</Text>
        </TouchableOpacity>
      </View>

      {post.video ? (
        <Video
          source={{ uri: post.video }}
          style={styles.image}
          resizeMode="cover"
          paused
          muted
          controls={false}
        />
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
          <Text style={styles.username}>{user.username || user.fullName || 'Unknown'} </Text>
          <Text style={styles.captionText}>{post.caption || ''}</Text>
        </View>
        {post.commentCount > 0 && (
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
});
