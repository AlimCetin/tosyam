import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

export const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hideFollowers, setHideFollowers] = useState(false);
  const [hideFollowing, setHideFollowing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userData = await userService.getUser('me');
      setHideFollowers(userData.hideFollowers || false);
      setHideFollowing(userData.hideFollowing || false);
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateProfile({
        hideFollowers,
        hideFollowing,
      });

      const updatedUser = await userService.getUser('me');
      authService.setCurrentUser(updatedUser);

      showToast('Gizlilik ayarları güncellendi', 'success');
    } catch (error: any) {
      console.error('Ayarlar güncellenemedi:', error);
      showToast(error.response?.data?.message || 'Ayarlar güncellenemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleManageHiddenFollowers = () => {
    navigation.navigate('ManageHiddenUsers', { type: 'followers' });
  };

  const handleManageHiddenFollowing = () => {
    navigation.navigate('ManageHiddenUsers', { type: 'following' });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Takipçiler</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="people-outline" size={24} color="#000" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Takipçi Listesini Gizle</Text>
              <Text style={styles.settingDescription}>
                Takipçi listenizi herkesten gizler
              </Text>
            </View>
          </View>
          <Switch
            value={hideFollowers}
            onValueChange={setHideFollowers}
            trackColor={{ false: '#dbdbdb', true: '#0095f6' }}
            thumbColor="#fff"
          />
        </View>

        {hideFollowers && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleManageHiddenFollowers}>
            <View style={styles.settingLeft}>
              <Icon name="eye-off-outline" size={24} color="#000" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Gizli Takipçileri Yönet</Text>
                <Text style={styles.settingDescription}>
                  Belirli takipçileri gizle
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color="#8e8e8e" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Takip Edilenler</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="people-outline" size={24} color="#000" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Takip Edilen Listesini Gizle</Text>
              <Text style={styles.settingDescription}>
                Takip ettiğiniz kişileri herkesten gizler
              </Text>
            </View>
          </View>
          <Switch
            value={hideFollowing}
            onValueChange={setHideFollowing}
            trackColor={{ false: '#dbdbdb', true: '#0095f6' }}
            thumbColor="#fff"
          />
        </View>

        {hideFollowing && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleManageHiddenFollowing}>
            <View style={styles.settingLeft}>
              <Icon name="eye-off-outline" size={24} color="#000" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Gizli Takip Edilenleri Yönet</Text>
                <Text style={styles.settingDescription}>
                  Belirli takip ettiklerinizi gizle
                </Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color="#8e8e8e" />
          </TouchableOpacity>
        )}
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
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  saveButton: {
    backgroundColor: '#0095f6',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

