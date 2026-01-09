import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const AccountsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz. Tüm gönderileriniz, yorumlarınız, mesajlarınız ve diğer verileriniz kalıcı olarak silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount();
              
              // Hesap silindikten sonra çıkış yap ve login ekranına yönlendir
              authService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              
              Alert.alert('Başarılı', 'Hesabınız başarıyla silindi.');
            } catch (error: any) {
              console.error('Hesap silme hatası:', error);
              Alert.alert(
                'Hata',
                error.response?.data?.message || 'Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
          <View style={styles.settingLeft}>
            <Icon name="trash-outline" size={24} color="#ed4956" />
            <Text style={[styles.settingText, styles.deleteText]}>Hesabı Sil</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#8e8e8e" />
        </TouchableOpacity>
      </View>

      <View style={styles.warningSection}>
        <Icon name="warning-outline" size={20} color="#ed4956" />
        <Text style={styles.warningText}>
          Hesabınızı silmek, tüm verilerinizin kalıcı olarak silinmesine neden olur. Bu işlem geri alınamaz.
        </Text>
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
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e8e',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  deleteText: {
    color: '#ed4956',
  },
  warningSection: {
    flexDirection: 'row',
    margin: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});

