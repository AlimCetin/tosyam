import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { userService } from '../services/userService';

export const BlockUserScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params;

  const handleBlock = async () => {
    try {
      await userService.blockUser(userId);
      Alert.alert('Başarılı', 'Kullanıcı engellendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı engellenemedi');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcıyı Engelle</Text>
      <Text style={styles.description}>
        Bu kullanıcıyı engellediğinizde, size mesaj gönderemez ve gönderilerinizi göremez.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleBlock}>
        <Text style={styles.buttonText}>Engelle</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>İptal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#ff3040',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#0095f6',
    fontSize: 16,
  },
});
