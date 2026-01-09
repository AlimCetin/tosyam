import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const ProfileMenuScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          navigation.goBack();
          navigation.navigate('BlockUser', { userId });
        }}>
        <Text style={styles.optionText}>Kullanıcıyı Engelle</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          navigation.goBack();
          navigation.navigate('ReportUser', { userId });
        }}>
        <Text style={[styles.optionText, styles.dangerText]}>Şikayet Et</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancel}
        onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>İptal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  option: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dangerText: {
    color: '#ff3040',
    fontWeight: '600',
  },
  cancel: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderRadius: 0,
  },
  cancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#0095f6',
  },
});
