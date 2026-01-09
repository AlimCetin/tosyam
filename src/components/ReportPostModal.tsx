import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { reportService } from '../services/reportService';

const REPORT_REASONS: { label: string; value: string }[] = [
  { label: 'Spam', value: 'spam' },
  { label: 'Taciz veya Zorbalık', value: 'harassment' },
  { label: 'Uygunsuz İçerik', value: 'inappropriate_content' },
  { label: 'Sahte Bilgi', value: 'fake_news' },
  { label: 'Nefret Söylemi', value: 'hate_speech' },
  { label: 'Telif Hakkı İhlali', value: 'copyright' },
  { label: 'Diğer', value: 'other' },
];

interface ReportPostModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
}

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  visible,
  postId,
  onClose,
}) => {
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
      await reportService.createReport(postId, 'post', selectedReason, details);
      Alert.alert('Başarılı', 'Şikayetiniz alındı', [
        { text: 'Tamam', onPress: onClose },
      ]);
      setSelectedReason('');
      setDetails('');
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Şikayet gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Gönderiyi Şikayet Et</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Bu gönderiyi neden şikayet ediyorsunuz?
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
            <Text style={styles.buttonText}>
              {loading ? 'Gönderiliyor...' : 'Şikayet Et'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    color: '#8e8e8e',
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
  buttonDisabled: {
    opacity: 0.6,
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

