import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { reportService } from '../services/reportService';

const REPORT_REASONS: { label: string; value: string }[] = [
  { label: 'Spam', value: 'spam' },
  { label: 'Taciz veya Zorbalık', value: 'harassment' },
  { label: 'Uygunsuz İçerik', value: 'inappropriate_content' },
  { label: 'Sahte Profil', value: 'fake_news' },
  { label: 'Nefret Söylemi', value: 'hate_speech' },
  { label: 'Telif Hakkı İhlali', value: 'copyright' },
  { label: 'Diğer', value: 'other' },
];

export const ReportUserScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params;
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!selectedReason) {
      Alert.alert('Hata', 'Lütfen bir sebep seçin');
      return;
    }

    try {
      setLoading(true);
      await reportService.createReport(userId, 'user', selectedReason, details);
      Alert.alert('Başarılı', 'Şikayetiniz alındı', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Şikayet gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Kullanıcıyı Şikayet Et</Text>
      <Text style={styles.description}>
        Bu kullanıcıyı neden şikayet ediyorsunuz?
      </Text>

      {REPORT_REASONS.map((reason) => (
        <TouchableOpacity
          key={reason.value}
          style={[
            styles.reasonItem,
            selectedReason === reason.value && styles.reasonSelected,
          ]}
          onPress={() => setSelectedReason(reason.value)}>
          <Text style={styles.reasonText}>{reason.label}</Text>
        </TouchableOpacity>
      ))}

      <TextInput
        style={styles.detailsInput}
        placeholder="Detaylar (isteğe bağlı)"
        value={details}
        onChangeText={setDetails}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleReport}
        disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Gönderiliyor...' : 'Şikayet Et'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>İptal</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: 20,
  },
  reasonItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    marginBottom: 12,
  },
  reasonSelected: {
    borderColor: '#0095f6',
    backgroundColor: '#f0f8ff',
  },
  reasonText: {
    fontSize: 16,
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0095f6',
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
    marginBottom: 20,
  },
  cancelText: {
    color: '#0095f6',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
