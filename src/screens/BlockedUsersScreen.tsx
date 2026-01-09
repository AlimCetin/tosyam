import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../services/userService';
import { User } from '../types';

export const BlockedUsersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getBlockedUsers();
      const normalizedUsers = data.map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      setBlockedUsers(normalizedUsers);
    } catch (error) {
      console.error('Engellenen kullanıcılar yüklenemedi:', error);
      Alert.alert('Hata', 'Engellenen kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    Alert.alert(
      'Engeli Kaldır',
      'Bu kullanıcının engelini kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engeli Kaldır',
          onPress: async () => {
            try {
              await userService.unblockUser(userId);
              setBlockedUsers(blockedUsers.filter((u) => u.id !== userId));
              Alert.alert('Başarılı', 'Engel kaldırıldı');
            } catch (error) {
              Alert.alert('Hata', 'Engel kaldırılamadı');
            }
          },
        },
      ]
    );
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const renderUser = ({ item }: { item: User }) => (
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
        style={styles.unblockButton}
        onPress={(e) => {
          e.stopPropagation();
          handleUnblock(item.id);
        }}>
        <Text style={styles.unblockText}>Engeli Kaldır</Text>
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
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="ban-outline" size={64} color="#dbdbdb" />
            <Text style={styles.emptyText}>Engellenen kullanıcı yok</Text>
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
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  unblockText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
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
    marginTop: 16,
  },
});

