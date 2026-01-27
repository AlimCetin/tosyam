import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validasyon
    if (!fullName.trim()) {
      showToast('Lütfen adınızı ve soyadınızı girin', 'warning');
      return;
    }
    if (!email.trim()) {
      showToast('Lütfen e-posta adresinizi girin', 'warning');
      return;
    }
    if (!email.includes('@')) {
      showToast('Lütfen geçerli bir e-posta adresi girin', 'warning');
      return;
    }
    if (!password.trim()) {
      showToast('Lütfen şifrenizi girin', 'warning');
      return;
    }
    if (password.length < 8) {
      showToast('Şifre en az 8 karakter olmalıdır', 'warning');
      return;
    }
    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      showToast(
        'Şifre en az bir büyük harf, bir küçük harf, bir sayı ve bir özel karakter içermelidir',
        'warning'
      );
      return;
    }

    setLoading(true);
    try {
      await authService.register(
        email.trim().toLowerCase(),
        password,
        fullName.trim()
      );
      // Başarılı kayıt sonrası ana sayfaya yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Kayıt yapılamadı';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Hesap Oluştur</Text>

          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#000',
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0095f6',
    borderRadius: 4,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    color: '#262626',
    fontSize: 14,
  },
  loginLink: {
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '600',
  },
});

