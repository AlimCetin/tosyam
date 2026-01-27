import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

export const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Şifre en az 8 karakter olmalıdır';
    }
    if (password.length > 100) {
      return 'Şifre en fazla 100 karakter olabilir';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Şifre en az bir küçük harf içermelidir';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Şifre en az bir büyük harf içermelidir';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Şifre en az bir rakam içermelidir';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Şifre en az bir özel karakter (@$!%*?&) içermelidir';
    }
    return null;
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      showToast('Mevcut şifre boş bırakılamaz', 'warning');
      return;
    }

    if (!newPassword.trim()) {
      showToast('Yeni şifre boş bırakılamaz', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Yeni şifreler eşleşmiyor', 'warning');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showToast(passwordError, 'warning');
      return;
    }

    try {
      setSaving(true);
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      showToast('Şifre başarıyla değiştirildi', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigation.goBack();
    } catch (error: any) {
      console.error('Şifre değiştirme hatası:', error);
      const errorMessage = error.response?.data?.message || 'Şifre değiştirilemedi';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Şifre Değiştir</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mevcut Şifre</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Mevcut şifrenizi girin"
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Icon
                name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#8e8e8e"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Yeni Şifre</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni şifrenizi girin"
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}>
              <Icon
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#8e8e8e"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Şifre en az 8 karakter, bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Yeni şifrenizi tekrar girin"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#8e8e8e"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleChangePassword}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Şifreyi Değiştir</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güvenlik İpuçları</Text>

        <View style={styles.tipItem}>
          <Icon name="shield-checkmark-outline" size={20} color="#0095f6" />
          <Text style={styles.tipText}>Güçlü ve benzersiz bir şifre kullanın</Text>
        </View>

        <View style={styles.tipItem}>
          <Icon name="lock-closed-outline" size={20} color="#0095f6" />
          <Text style={styles.tipText}>Şifrenizi düzenli olarak değiştirin</Text>
        </View>

        <View style={styles.tipItem}>
          <Icon name="key-outline" size={20} color="#0095f6" />
          <Text style={styles.tipText}>Şifrenizi kimseyle paylaşmayın</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e8e',
    marginTop: 16,
    marginBottom: 16,
    textTransform: 'uppercase',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  eyeIcon: {
    padding: 12,
  },
  hint: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 4,
    lineHeight: 16,
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
    fontSize: 16,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 12,
    flex: 1,
  },
});

