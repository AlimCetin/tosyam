import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../services/userService';
import { User } from '../types';

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Navigasyon animasyonu biterken veya hemen sonra odaklanması için kısa bir gecikme
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const searchUsers = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await userService.searchUsers(text);
      setResults(data);
    } catch (error) {
      console.error('Arama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon name="search-circle" size={24} color="#757575" />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Ara"
          value={query}
          onChangeText={searchUsers}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleUserPress(item.id)}>
            <Image
              source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.fullName}>{item.fullName}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
          ) : null
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    margin: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
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
  username: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  fullName: {
    color: '#8e8e8e',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8e8e8e',
  },
});
