import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [privateAccount, setPrivateAccount] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  React.useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // Önce storage'dan kontrol et, yoksa API'den çek
      let currentUser = authService.getCurrentUser() as any;
      if (!currentUser || !currentUser.role) {
        currentUser = await userService.getCurrentUser() as any;
      }
      const isAdminUser = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';
      setIsAdmin(isAdminUser || false);
    } catch (error) {
      console.error('Admin durumu kontrol edilemedi:', error);
      // Hata durumunda storage'dan tekrar kontrol et
      const storedUser = authService.getCurrentUser() as any;
      if (storedUser?.role) {
        const isAdminUser = storedUser.role === 'admin' || storedUser.role === 'super_admin' || storedUser.role === 'moderator';
        setIsAdmin(isAdminUser || false);
      }
    }
  };

  const handleAdminPanel = () => {
    navigation.navigate('AdminPanel');
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleBlockedUsers = () => {
    navigation.navigate('BlockedUsers');
  };

  const handlePrivacy = () => {
    navigation.navigate('PrivacySettings');
  };

  const handleSecurity = () => {
    navigation.navigate('SecuritySettings');
  };

  const handleAccountSettings = () => {
    navigation.navigate('AccountSettings');
  };

  const handleAbout = () => {
    showToast('Tosyam v1.0.0', 'info');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleBlockedUsers}>
            <View style={styles.settingLeft}>
              <Icon name="ban" size={24} color="#FF1744" />
              <Text style={styles.settingText}>Engellenen Kullanıcılar</Text>
            </View>
            <Icon name="chevron-forward-outline" size={22} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <View style={styles.settingLeft}>
              <Icon name="lock-closed" size={24} color="#424242" />
              <Text style={styles.settingText}>Gizlilik</Text>
            </View>
            <Icon name="chevron-forward-outline" size={22} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleSecurity}>
            <View style={styles.settingLeft}>
              <Icon name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.settingText}>Güvenlik</Text>
            </View>
            <Icon name="chevron-forward-outline" size={22} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleAccountSettings}>
            <View style={styles.settingLeft}>
              <Icon name="person-circle" size={26} color="#424242" />
              <Text style={styles.settingText}>Hesap Ayarları</Text>
            </View>
            <Icon name="chevron-forward-outline" size={22} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications-circle-outline" size={26} color="#424242" />
              <Text style={styles.settingText}>Bildirimleri Aç</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#dbdbdb', true: '#0095f6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin</Text>

            <TouchableOpacity style={styles.settingItem} onPress={handleAdminPanel}>
              <View style={styles.settingLeft}>
                <Icon name="shield" size={24} color="#9C27B0" />
                <Text style={[styles.settingText, styles.adminText]}>Admin Paneli</Text>
              </View>
              <Icon name="chevron-forward-outline" size={22} color="#757575" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diğer</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
            <View style={styles.settingLeft}>
              <Icon name="information-circle" size={26} color="#424242" />
              <Text style={styles.settingText}>Hakkında</Text>
            </View>
            <Icon name="chevron-forward-outline" size={22} color="#757575" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ConfirmationModal
        isVisible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Çıkış Yap"
        message="Çıkış yapmak istediğinize emin misiniz?"
        confirmText="Çıkış Yap"
        isDestructive
        icon="log-out-outline"
      />
    </SafeAreaView>
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
  logoutButton: {
    margin: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ed4956',
  },
  adminText: {
    color: '#0095f6',
    fontWeight: '600',
  },
});

