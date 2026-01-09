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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { User } from '../types';

export const ManageHiddenUsersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { type } = route.params; // 'followers' or 'following'
  
  const [users, setUsers] = useState<User[]>([]);
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [type]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const currentUser = await userService.getUser('me');
      const hiddenList = type === 'followers' 
        ? (currentUser.hiddenFollowers || [])
        : (currentUser.hiddenFollowing || []);
      
      setHiddenUsers(hiddenList.map((id: any) => id.toString()));

      const userList = type === 'followers'
        ? await userService.getFollowers('me')
        : await userService.getFollowing('me');
      
      setUsers(userList);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      Alert.alert('Hata', 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const toggleHidden = (userId: string) => {
    if (hiddenUsers.includes(userId)) {
      setHiddenUsers(hiddenUsers.filter((id) => id !== userId));
    } else {
      setHiddenUsers([...hiddenUsers, userId]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData: any = {};
      if (type === 'followers') {
        updateData.hiddenFollowers = hiddenUsers;
      } else {
        updateData.hiddenFollowing = hiddenUsers;
      }

      await userService.updateProfile(updateData);

      const updatedUser = await userService.getUser('me');
      authService.setCurrentUser(updatedUser);

      Alert.alert('Başarılı', 'Gizlilik ayarları güncellendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Ayarlar güncellenemedi:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Ayarlar güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const isHidden = hiddenUsers.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleHidden(item.id)}
        activeOpacity={0.7}>
        <Image
          source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>{item.fullName}</Text>
          {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
        </View>
        <View style={[styles.checkbox, isHidden && styles.checkboxChecked]}>
          {isHidden && <Icon name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

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
              {type === 'followers' ? 'Takipçi yok' : 'Takip edilen yok'}
            </Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dbdbdb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

