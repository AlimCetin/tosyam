import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { User } from '../types';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      const userData = await userService.getUser('me');
      
      setUser(userData);
      setFullName(userData.fullName || '');
      setBio(userData.bio || '');
      setAvatarUri(userData.avatar || null);
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error);
      Alert.alert('Hata', 'Profil bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 1000,
      height: 1000,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 0.8,
      includeBase64: true, // Base64 formatında al
    })
      .then((image) => {
        if (image.data) {
          // Base64 string olarak kaydet (data:image/jpeg;base64,... formatında)
          const base64Image = `data:${image.mime};base64,${image.data}`;
          setSelectedImage(base64Image);
          setAvatarUri(base64Image);
        }
      })
      .catch((error) => {
        if (error.message !== 'User cancelled image selection') {
          console.error('Resim seçme hatası:', error);
          Alert.alert('Hata', 'Resim seçilemedi');
        }
      });
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Ad Soyad boş bırakılamaz');
      return;
    }

    if (fullName.length > 50) {
      Alert.alert('Hata', 'Ad Soyad en fazla 50 karakter olabilir');
      return;
    }

    if (bio.length > 150) {
      Alert.alert('Hata', 'Bio en fazla 150 karakter olabilir');
      return;
    }

    try {
      setSaving(true);
      
      // Seçilen resmi kullan
      let avatarUrl = avatarUri;
      if (selectedImage) {
        avatarUrl = selectedImage;
      }

      await userService.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatar: avatarUrl || undefined,
      });

      // Kullanıcı bilgilerini güncelle
      const updatedUser = await userService.getUser('me');
      authService.setCurrentUser(updatedUser);

      Alert.alert('Başarılı', 'Profil güncellendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Profil güncellenemedi:', error);
      Alert.alert('Hata', error.response?.data?.message || 'Profil güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  const hasAvatar = !!avatarUri;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={40} color="#8e8e8e" />
              </View>
            )}
            <View style={[styles.avatarIconContainer, hasAvatar && styles.avatarIconContainerWithImage]}>
              {hasAvatar ? (
                <Icon name="create-outline" size={20} color="#fff" />
              ) : (
                <Icon name="add-circle" size={24} color="#0095f6" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ad Soyad"
            maxLength={50}
            autoCapitalize="words"
          />
          <Text style={styles.charCount}>{fullName.length}/50</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Hakkında"
            maxLength={150}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/150</Text>
        </View>

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
    </ScrollView>
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
  content: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarIconContainerWithImage: {
    backgroundColor: '#0095f6',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#8e8e8e',
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
