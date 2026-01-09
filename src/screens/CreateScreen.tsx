import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { postService } from '../services/postService';

export const CreateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [hiddenFromFollowers, setHiddenFromFollowers] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.hiddenFromFollowers) {
        setHiddenFromFollowers(route.params.hiddenFromFollowers);
        // Clear params after reading to avoid stale data
        navigation.setParams({ hiddenFromFollowers: undefined });
      }
    }, [route?.params?.hiddenFromFollowers, navigation])
  );

  const pickImage = () => {
    setVideo(null);
    ImagePicker.openPicker({
      width: 1000,
      height: 1000,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: false,
    })
      .then((image) => {
        if (image.path) {
          setImage(image.path);
        }
      })
      .catch((error) => {
        if (error.message !== 'User cancelled image selection') {
          console.error('Resim seçme hatası:', error);
          Alert.alert('Hata', 'Resim seçilemedi');
        }
      });
  };

  const pickVideo = () => {
    setImage(null);
    launchImageLibrary({ mediaType: 'video', videoQuality: 'high', selectionLimit: 1 }, (response) => {
      const asset = response.assets && response.assets[0];
      if (asset?.uri) {
        setVideo(asset.uri);
      }
    });
  };

  const handlePost = async () => {
    if (!image && !video) {
      Alert.alert('Hata', 'Lütfen fotoğraf veya video seçin');
      return;
    }

    try {
      await postService.createPost(image || undefined, caption, isPrivate, hiddenFromFollowers, video || undefined);
      Alert.alert('Başarılı', 'Gönderi paylaşıldı', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Gönderi paylaşılamadı');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>İptal</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Yeni Gönderi</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.share}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {image || video ? (
          <View>
            {image ? (
              <Image source={{ uri: image }} style={styles.preview} />
            ) : (
              <Video source={{ uri: video! }} style={styles.preview} resizeMode="contain" controls />
            )}
            <TouchableOpacity 
              style={styles.changeMediaButton}
              onPress={() => {
                setImage(null);
                setVideo(null);
              }}
            >
              <Icon name="close-circle" size={24} color="#fff" />
              <Text style={styles.changeMediaText}>Medyayı Değiştir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            <Icon name="cloud-upload-outline" size={64} color="#0095f6" />
            <Text style={styles.uploadTitle}>Fotoğraf veya Video Seç</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <Icon name="camera-outline" size={32} color="#0095f6" />
                <Text style={styles.mediaButtonText}>Fotoğraf</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                <Icon name="videocam-outline" size={32} color="#0095f6" />
                <Text style={styles.mediaButtonText}>Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TextInput
          style={styles.captionInput}
          placeholder="Açıklama yaz..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={2200}
        />

        <View style={styles.privacySection}>
          <View style={styles.privacyItem}>
            <View style={styles.privacyLeft}>
              <Icon name="lock-closed-outline" size={24} color="#000" />
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyTitle}>Sadece Takipçiler</Text>
                <Text style={styles.privacyDescription}>
                  Gönderiyi sadece takip edenleriniz görebilir
                </Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#dbdbdb', true: '#0095f6' }}
              thumbColor="#fff"
            />
          </View>

          {isPrivate && (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => {
                navigation.navigate('SelectHiddenFollowers', { 
                  initialHidden: hiddenFromFollowers,
                });
              }}>
              <Icon name="eye-off-outline" size={20} color="#0095f6" />
              <Text style={styles.manageButtonText}>
                Belirli Takipçilerden Gizle {hiddenFromFollowers.length > 0 && `(${hiddenFromFollowers.length})`}
              </Text>
              <Icon name="chevron-forward" size={20} color="#8e8e8e" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  cancel: {
    fontSize: 16,
    color: '#000',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  share: {
    fontSize: 16,
    color: '#0095f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  uploadArea: {
    height: 350,
    borderWidth: 2,
    borderColor: '#dbdbdb',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginTop: 16,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  mediaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0095f6',
    minWidth: 120,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0095f6',
    marginTop: 8,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  changeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changeMediaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  captionInput: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  privacySection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  manageButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
});
