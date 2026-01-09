import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { userService } from '../services/userService';
import { User } from '../types';

export const FollowListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId, type } = route.params; // type: 'followers' | 'following'
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [userId, type]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = type === 'followers' 
        ? await userService.getFollowers(userId)
        : await userService.getFollowing(userId);
      
      // Normalize user data
      const normalizedUsers = data.map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      
      setUsers(normalizedUsers);
    } catch (error) {
      console.error('Liste yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (targetUserId: string) => {
    navigation.navigate('Profile', { userId: targetUserId });
  };

  const handleFollow = async (targetUserId: string, index: number) => {
    try {
      const user = users[index];
      if (user.isFollowing) {
        await userService.unfollowUser(targetUserId);
        setUsers(prev => prev.map((u, i) => 
          i === index ? { ...u, isFollowing: false, followerCount: Math.max(0, (u.followerCount || 0) - 1) } : u
        ));
      } else {
        await userService.followUser(targetUserId);
        setUsers(prev => prev.map((u, i) => 
          i === index ? { ...u, isFollowing: true, followerCount: (u.followerCount || 0) + 1 } : u
        ));
      }
    } catch (error) {
      console.error('Takip hatası:', error);
    }
  };

  const renderUser = ({ item, index }: { item: User; index: number }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(item.id)}
      activeOpacity={0.7}>
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.fullName}>{item.fullName}</Text>
        {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
      </View>
      <TouchableOpacity
        style={[styles.followButton, item.isFollowing && styles.followingButton]}
        onPress={(e) => {
          e.stopPropagation();
          handleFollow(item.id, index);
        }}>
        <Text style={[styles.followButtonText, item.isFollowing && styles.followingButtonText]}>
          {item.isFollowing ? 'Takipten Çık' : 'Takip Et'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {type === 'followers' ? 'Henüz takipçi yok' : 'Henüz takip edilen yok'}
            </Text>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  fullName: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  bio: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0095f6',
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  followingButtonText: {
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
});

