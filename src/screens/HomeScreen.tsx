import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationsContext';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { PostCard } from '../components/PostCard';
import { AdCard } from '../components/AdCard';
import { CampaignCard } from '../components/CampaignCard';
import { PlaceCard } from '../components/PlaceCard';
import { postService } from '../services/postService';
import { notificationService } from '../services/notificationService';
import { messageService } from '../services/messageService';
import { locationService } from '../services/locationService';
import { campaignService } from '../services/campaignService';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const { socket } = useNotifications();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [visiblePostIds, setVisiblePostIds] = useState<string[]>([]);
  const [city, setCity] = useState<string>('');

  const loadFeed = async () => {
    console.log('🔄 Feed yükleniyor...');
    setLoading(true);
    setError(null);
    try {
      const detectedCity = await locationService.getCurrentCity();
      setCity(detectedCity);

      const response = await postService.getFeed(1, 20, detectedCity);
      const postsData = response.posts || response;
      setPosts(postsData || []);

      if (!postsData || postsData.length === 0) {
        setError('Henüz gönderi yok. İlk gönderiyi sen paylaş!');
      }
    } catch (error: any) {
      console.error('❌ Feed yüklenemedi:', error);
      setError('Gönderiler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      if (socket) {
        try {
          console.log('📡 Rabbit/Socket: Okunmamış sayıları istemek için event gönderiliyor...');
          const counts = await new Promise<{ notificationCount: number, messageCount: number }>((resolve, reject) => {
            const timeout = setTimeout(() => {
              console.log('⏱️ Rabbit/Socket: Zaman aşımı (2s) - API fallbacke geçiliyor');
              reject(new Error('Socket timeout'));
            }, 2000);

            socket.once('unreadCounts', (data: any) => {
              console.log('📥 Rabbit/Socket: Veri alındı!', data);
              clearTimeout(timeout);
              resolve(data);
            });

            socket.emit('requestUnreadCounts');
          });

          setUnreadNotifications(counts.notificationCount);
          setUnreadMessages(counts.messageCount);
          console.log('✅ Rabbit/Socket ile sayılar başarıyla güncellendi.');
          return;
        } catch (socketError) {
          console.log('⚠️ Rabbit/Socket hatası veya zaman aşımı, API kullanılıyor.');
        }
      }

      console.log('🌐 Loading unread counts via API fallback...');
      const notificationCount = await notificationService.getUnreadCount();
      setUnreadNotifications(notificationCount);
      const messageCount = await messageService.getUnreadCount();
      setUnreadMessages(messageCount);
    } catch (error) {
      console.error('Okunmamış sayılar yüklenemedi:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeed();
      loadUnreadCounts();
    }, [socket]) // socket eklendi
  );

  // Socket bağlandığında sayıları hemen güncelle
  useEffect(() => {
    if (socket) {
      console.log('📡 Socket bağlandı, okunmamış sayıları güncelleniyor...');
      loadUnreadCounts();
    }
  }, [socket]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    waitForInteraction: false,
    minimumViewTime: 100,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const visibleIds = viewableItems.map((item: any) => item.item.id);
    setVisiblePostIds(visibleIds);
  }).current;

  const handleLike = async (postId: string) => {
    const post = posts.find((p) => (p.id || p._id) === postId);
    if (!post) return;
    const wasLiked = post.isLiked;
    setPosts(posts.map((p) => (p.id || p._id) === postId ? { ...p, isLiked: !wasLiked, likeCount: wasLiked ? (p.likeCount || 0) - 1 : (p.likeCount || 0) + 1 } : p));
    try {
      if (wasLiked) await postService.unlikePost(postId); else await postService.likePost(postId);
    } catch (error) {
      setPosts(posts.map((p) => (p.id || p._id) === postId ? { ...p, isLiked: wasLiked, likeCount: wasLiked ? (p.likeCount || 0) + 1 : (p.likeCount || 0) - 1 } : p));
    }
  };

  const handleSave = async (postId: string) => {
    const post = posts.find((p) => (p.id || p._id) === postId);
    if (!post) return;
    const wasSaved = post.isSaved || false;
    setPosts(posts.map((p) => (p.id || p._id) === postId ? { ...p, isSaved: !wasSaved } : p));
    try {
      if (wasSaved) await postService.unsavePost(postId); else await postService.savePost(postId);
    } catch (error) {
      setPosts(posts.map((p) => (p.id || p._id) === postId ? { ...p, isSaved: wasSaved } : p));
    }
  };

  const handleShare = async (postId: string) => {
    const post = posts.find((p) => (p.id || p._id) === postId);
    if (!post) return;
    try {
      const shareMessage = post.caption || 'Bir gönderi paylaştı';
      await Share.open({ message: shareMessage });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimCode = async (campaign: any) => {
    try {
      const result = await campaignService.claimCode(campaign._id);
      Alert.alert('Tebrikler!', `İndirim kodunuz: ${result.code}\nBu kodu işletmede göstererek indiriminizi kullanabilirsiniz.`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Kod alınamadı.';
      Alert.alert('Hata', msg);
    }
  };

  const handleComment = (postId: string) => navigation.navigate('Comments', { postId });
  const handleProfilePress = (userId: string) => navigation.navigate('Profile', { userId });
  const handleSearchPress = () => navigation.navigate('Search');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cityBar}>
        <Icon name="location-outline" size={14} color="#666" />
        <Text style={styles.cityText}>{city || 'Konum aranıyor...'}</Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress} activeOpacity={0.7}>
          <Icon name="search-outline" size={24} color="#757575" />
          <View style={styles.searchPlaceholder}>
            <TextInput style={styles.searchInput} placeholder="Ara" placeholderTextColor="#8e8e8e" editable={false} />
          </View>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Icon name="notifications-circle-outline" size={28} color="#424242" />
            {unreadNotifications > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadNotifications > 99 ? '99+' : unreadNotifications}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Messages')}>
            <Icon name="mail-outline" size={28} color="#424242" />
            {unreadMessages > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadMessages > 99 ? '99+' : unreadMessages}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#8e8e8e" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFeed}><Text style={styles.retryButtonText}>Tekrar Dene</Text></TouchableOpacity>
        </View>
      )}
      <FlatList
        data={posts}
        keyExtractor={(item, index) => item.id || item._id || index.toString()}
        renderItem={({ item }) => {
          if (item.type === 'ad') return <AdCard ad={item} />;
          if (item.type === 'campaign') return <CampaignCard item={item} onClaim={handleClaimCode} hideOptions={true} />;
          if (item.type === 'place') return <PlaceCard item={item} hideOptions={true} />;
          return (
            <PostCard
              post={item}
              onLike={handleLike}
              onComment={handleComment}
              onSave={handleSave}
              onShare={handleShare}
              onProfilePress={handleProfilePress}
              isVisible={visiblePostIds.includes(item.id || item._id)}
            />
          );
        }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFeed} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" color="#0095f6" style={{ marginTop: 50 }} /> : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  cityBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cityText: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#dbdbdb' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 12, borderRadius: 8, marginRight: 10, height: 36 },
  searchPlaceholder: { flex: 1 },
  searchInput: { flex: 1, fontSize: 14, color: '#000' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 4, position: 'relative' },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ff3040', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 16, color: '#8e8e8e', textAlign: 'center', marginTop: 16, marginBottom: 24 },
  retryButton: { backgroundColor: '#0095f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 4 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
