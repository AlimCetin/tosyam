import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export const AccountSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleAccounts = () => {
    navigation.navigate('Accounts');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Yönetimi</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleAccounts}>
          <View style={styles.settingLeft}>
            <Icon name="person-outline" size={24} color="#000" />
            <Text style={styles.settingText}>Hesaplar</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#8e8e8e" />
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
});

