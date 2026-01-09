import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { User } from '../types';

export const SelectHiddenFollowersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { postId, initialHidden, initialIsPrivate, mode } = route.params || {};
  
  const [followers, setFollowers] = useState<User[]>([]);
  const [isPrivate, setIsPrivate] = useState<boolean>(initialIsPrivate ?? false);
  const [hiddenFollowers, setHiddenFollowers] = useState<string[]>(initialHidden || []);
  const [loading, setLoading] = useState(true);

  // Route params değiştiğinde state'i güncelle
  useEffect(() => {
    console.log('📥 SelectHiddenFollowersScreen params:', {
      postId,
      initialHidden,
      initialIsPrivate,
      mode
    });
    
    if (initialIsPrivate !== undefined) {
      setIsPrivate(initialIsPrivate);
    }
    if (initialHidden !== undefined) {
      setHiddenFollowers(initialHidden);
    }
  }, [initialHidden, initialIsPrivate, postId, mode]);

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    try {
      setLoading(true);
      const data = await userService.getFollowers('me');
      const normalizedFollowers = data.map((user: any) => ({
        ...user,
        id: user._id || user.id,
      }));
      setFollowers(normalizedFollowers);
    } catch (error) {
      console.error('Takipçiler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHidden = (userId: string) => {
    if (hiddenFollowers.includes(userId)) {
      setHiddenFollowers(hiddenFollowers.filter((id) => id !== userId));
    } else {
      setHiddenFollowers([...hiddenFollowers, userId]);
    }
  };

  const handleSave = async () => {
    try {
      if (postId && mode === 'post_visibility') {
        // Update a post's visibility directly
        const payload = !isPrivate 
          ? { isPrivate: false, hiddenFromFollowers: [] }
          : { isPrivate: true, hiddenFromFollowers: hiddenFollowers };
        
        console.log('📤 Görünürlük güncelleniyor:', {
          postId,
          isPrivate,
          hiddenFollowersCount: hiddenFollowers.length,
          hiddenFollowers,
          payload
        });
        
        const result = await postService.updateVisibility(postId, payload);
        console.log('✅ Görünürlük güncellendi:', result);
        
        navigation.goBack();
      } else {
        // Pass data back to Create screen
        navigation.navigate('Create', {
          hiddenFromFollowers: hiddenFollowers,
        });
      }
    } catch (e) {
      console.error('❌ Gizlilik güncellenemedi:', e);
      navigation.goBack();
    }
  };

  const renderFollower = ({ item }: { item: User }) => {
    const isHidden = hiddenFollowers.includes(item.id);
    
    return (
      <TouchableOpacity
        style={styles.followerItem}
        onPress={() => toggleHidden(item.id)}
        activeOpacity={0.7}>
        <Image
          source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.followerInfo}>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Görünürlük Ayarları</Text>
        <Text style={styles.headerStatus}>
          {!isPrivate 
            ? 'Herkese Açık' 
            : hiddenFollowers.length > 0 
              ? `${hiddenFollowers.length} Takipçiden Gizleniyor`
              : 'Tüm Takipçiler'}
        </Text>
      </View>

      <View style={styles.privacySection}>
        <View style={styles.privacyItem}>
          <View style={styles.privacyLeft}>
            <Icon 
              name={isPrivate ? 'lock-closed-outline' : 'earth-outline'} 
              size={24} 
              color="#000" 
            />
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Sadece Takipçiler</Text>
              <Text style={styles.privacyDescription}>
                {isPrivate 
                  ? 'Gönderiyi sadece takipçileriniz görebilir' 
                  : 'Gönderi herkese açık'}
              </Text>
            </View>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={(value) => {
              setIsPrivate(value);
              if (!value) {
                // Herkese açık yapınca seçimleri temizle
                setHiddenFollowers([]);
              }
            }}
            trackColor={{ false: '#dbdbdb', true: '#0095f6' }}
            thumbColor="#fff"
          />
        </View>

        {isPrivate && (
          <View style={[
            styles.hiddenInfo,
            hiddenFollowers.length > 0 && styles.hiddenInfoSelected
          ]}>
            <Icon 
              name="eye-off-outline" 
              size={20} 
              color={hiddenFollowers.length > 0 ? '#ff3040' : '#8e8e8e'} 
            />
            <Text style={styles.hiddenInfoText}>
              {hiddenFollowers.length > 0 
                ? `${hiddenFollowers.length} takipçi seçildi - bu takipçiler gönderiyi göremez` 
                : 'Belirli takipçileri gizlemek için aşağıdan seçin'}
            </Text>
          </View>
        )}
      </View>

      {isPrivate && (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={renderFollower}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Takipçi yok</Text>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerStatus: {
    fontSize: 14,
    color: '#0095f6',
    fontWeight: '600',
  },
  privacySection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 13,
    color: '#8e8e8e',
  },
  hiddenInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f0ff',
  },
  hiddenInfoSelected: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffe0e0',
  },
  hiddenInfoText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  followerItem: {
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
  followerInfo: {
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

