import React, { useEffect, useState } from 'react';
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
import { postService } from '../services/postService';

export const LikesListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { postId } = route.params as any;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLikes(1, true);
  }, [postId]);

  const loadLikes = async (targetPage = 1, reset = false) => {
    if (!hasMore && !reset) return;
    if (loading && !reset) return;
    try {
      if (reset) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const { users: result, pagination } = await postService.getLikes(postId, targetPage, 30);
      setUsers((prev) => (reset ? result : [...prev, ...result]));
      setHasMore(pagination?.hasMore ?? false);
      setPage(targetPage);
    } catch (e) {
      console.error('Beğeniler yüklenemedi:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
      activeOpacity={0.7}>
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/48' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.fullName} numberOfLines={1}>
          {item.fullName || item.username || 'Kullanıcı'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading && users.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => hasMore && loadLikes(page + 1)}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={() => loadLikes(1, true)}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>Henüz beğeni yok</Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color="#0095f6" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  fullName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  empty: {
    color: '#8e8e8e',
  },
  footerLoading: {
    paddingVertical: 12,
  },
});


