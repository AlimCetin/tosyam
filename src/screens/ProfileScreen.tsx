import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { authService } from '../services/authService';
import { User, Post } from '../types';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Screen focus olduğunda veya params değiştiğinde çalışır
  useFocusEffect(
    useCallback(() => {
      const routeUserId = route?.params?.userId;
      
      // Eğer route params'ında userId yoksa veya 'current-user-id'/'me' ise kendi profilini göster
      // Aksi halde başkasının profilini göster
      const targetUserId = (!routeUserId || routeUserId === 'current-user-id' || routeUserId === 'me')
        ? 'current-user-id'
        : routeUserId;
      
      loadProfile(targetUserId);
    }, [route?.params?.userId])
  );

  const loadProfile = async (userId: string) => {
    try {
      // Mevcut kullanıcıyı al
      const currentUser = authService.getCurrentUser() as any;
      const currentUserId = currentUser?._id || currentUser?.id;
      
      // userId 'current-user-id' veya 'me' ise mevcut kullanıcıyı al
      const isViewingOwnProfile = userId === 'current-user-id' || userId === 'me';
      const targetUserId = isViewingOwnProfile ? 'me' : userId;
      
      const userData = await userService.getUser(targetUserId);
      const postsResponse = await postService.getUserPosts(targetUserId);
      const postsData = postsResponse.posts || postsResponse; // Backward compatibility
      
      // Normalize posts (add isHidden if not present)
      const normalizedPosts = (Array.isArray(postsData) ? postsData : []).map((post: any) => ({
        ...post,
        isHidden: post.isHidden ?? false,
      }));
      
      console.log('👤 Backend\'den gelen user data:', {
        id: (userData as any)._id || userData.id,
        followerCount: userData.followerCount,
        followingCount: userData.followingCount,
        isFollowing: userData.isFollowing,
        followers: (userData as any).followers?.length,
        following: (userData as any).following?.length,
      });
      
      // Backend'den gelen user objesini normalize et (_id -> id)
      const normalizedUser: User = {
        ...userData,
        id: (userData as any)._id || userData.id,
        followerCount: userData.followerCount ?? ((userData as any).followers?.length || 0),
        followingCount: userData.followingCount ?? ((userData as any).following?.length || 0),
        isFollowing: userData.isFollowing ?? false,
      };
      
      console.log('✅ Normalize edilmiş user:', {
        id: normalizedUser.id,
        followerCount: normalizedUser.followerCount,
        followingCount: normalizedUser.followingCount,
        isFollowing: normalizedUser.isFollowing,
      });
      
      setUser(normalizedUser);
      setPosts(normalizedPosts);
      
      // Kendi profili mi kontrol et
      const userDataId = normalizedUser.id;
      const isOwn = isViewingOwnProfile || (currentUserId && userDataId === currentUserId);
      
      setIsOwnProfile(isOwn);
    } catch (error) {
      console.error('Profil yüklenemedi:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !user.id) return;
    try {
      if (user.isFollowing) {
        await userService.unfollowUser(user.id);
        setUser({ 
          ...user, 
          isFollowing: false, 
          followerCount: Math.max(0, (user.followerCount || 0) - 1) 
        });
      } else {
        await userService.followUser(user.id);
        setUser({ 
          ...user, 
          isFollowing: true, 
          followerCount: (user.followerCount || 0) + 1 
        });
      }
    } catch (error: any) {
      console.error('Takip hatası:', error.response?.data || error.message);
      // Hata durumunda profil bilgilerini yeniden yükle
      if (error.response?.status === 400 && error.response?.data?.message === 'Already following') {
        // Zaten takip ediyor, state'i güncelle
        setUser({ ...user, isFollowing: true });
      }
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.avatar || 'https://via.placeholder.com/90' }}
          style={styles.avatar}
        />
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Gönderi</Text>
          </View>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              // Kendi profiliyse her zaman göster
              if (isOwnProfile) {
                const targetUserId = user.id === 'current-user-id' || user.id === 'me' 
                  ? 'current-user-id' 
                  : user.id;
                navigation.navigate('FollowList', { userId: targetUserId, type: 'followers' });
                return;
              }
              
              // Başkasının profili ve gizliyse
              if (user.hideFollowers) {
                Alert.alert('Gizli', 'Bu kullanıcı takipçi listesini gizlemiş');
                return;
              }
              
              const targetUserId = user.id;
              navigation.navigate('FollowList', { userId: targetUserId, type: 'followers' });
            }}>
            <Text style={styles.statNumber}>
              {!isOwnProfile && user.hideFollowers ? '—' : (user.followerCount ?? 0)}
            </Text>
            <Text style={styles.statLabel}>Takipçi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => {
              // Kendi profiliyse her zaman göster
              if (isOwnProfile) {
                const targetUserId = user.id === 'current-user-id' || user.id === 'me' 
                  ? 'current-user-id' 
                  : user.id;
                navigation.navigate('FollowList', { userId: targetUserId, type: 'following' });
                return;
              }
              
              // Başkasının profili ve gizliyse
              if (user.hideFollowing) {
                Alert.alert('Gizli', 'Bu kullanıcı takip edilen listesini gizlemiş');
                return;
              }
              
              const targetUserId = user.id;
              navigation.navigate('FollowList', { userId: targetUserId, type: 'following' });
            }}>
            <Text style={styles.statNumber}>
              {!isOwnProfile && user.hideFollowing ? '—' : (user.followingCount ?? 0)}
            </Text>
            <Text style={styles.statLabel}>Takip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.fullName}>{user.fullName}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      <View style={styles.actions}>
        {isOwnProfile ? (
          // Kendi profili - Düzenle, Kaydedilenler ve Ayarlar butonları
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEditProfile}>
              <Text style={[styles.buttonText, { color: '#000' }]}>Profili Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.savedButton}
              onPress={() => navigation.navigate('SavedPosts')}>
              <Icon name="ribbon-outline" size={22} color="#424242" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettings}>
              <Icon name="settings-sharp" size={22} color="#424242" />
            </TouchableOpacity>
          </>
        ) : (
          // Başkasının profili - Takip ve Mesaj butonları
          <>
            <TouchableOpacity
              style={[styles.button, user.isFollowing && styles.following]}
              onPress={handleFollow}>
              <Text style={[styles.buttonText, user.isFollowing && styles.buttonTextSecondary]}>
                {user.isFollowing ? 'Takipten Çık' : 'Takip Et'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondary]}
              onPress={() => navigation.navigate('Chat', { receiverId: user.id })}>
              <Text style={[styles.buttonText, { color: '#000' }]}>Mesaj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                navigation.navigate('ProfileMenu', { userId: user.id });
              }}>
              <Icon name="ellipsis-horizontal-circle-outline" size={24} color="#424242" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postThumb}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
            {item.video ? (
              <View style={[styles.thumbImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }]}>
                <Icon name="play-circle" size={32} color="#fff" />
              </View>
            ) : (
              <Image source={{ uri: item.image || '' }} style={styles.thumbImage} />
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    marginRight: 24,
  },
  stats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    minWidth: 60,
  },
  statNumber: {
    fontWeight: '600',
    fontSize: 16,
    color: '#262626',
  },
  statLabel: {
    fontSize: 13,
    color: '#8e8e8e',
    marginTop: 2,
  },
  info: {
    marginBottom: 16,
  },
  fullName: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
    color: '#000',
  },
  bio: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  button: {
    flex: 1,
    backgroundColor: '#0095f6',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#efefef',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  following: {
    backgroundColor: '#efefef',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  secondary: {
    backgroundColor: '#efefef',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextSecondary: {
    color: '#000',
  },
  savedButton: {
    padding: 6,
    backgroundColor: '#efefef',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  settingsButton: {
    padding: 6,
    backgroundColor: '#efefef',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  moreButton: {
    padding: 6,
    backgroundColor: '#efefef',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  postThumb: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#efefef',
  },
});
