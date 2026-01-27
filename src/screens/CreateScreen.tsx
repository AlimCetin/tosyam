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
  Platform,
  ActionSheetIOS,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { postService } from '../services/postService';
import { MediaPickerModal } from '../components/MediaPickerModal';

export const CreateScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const route = useRoute<any>();
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [hiddenFromFollowers, setHiddenFromFollowers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'video'>('image');

  // Ekrana blur olduğunda (kullanıcı başka ekrana geçtiğinde) form verilerini temizle
  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.hiddenFromFollowers) {
        setHiddenFromFollowers(route.params.hiddenFromFollowers);
        // Clear params after reading to avoid stale data
        navigation.setParams({ hiddenFromFollowers: undefined });
      }

      // Cleanup function: ekrandan ayrılırken form verilerini temizle
      return () => {
        setImage(null);
        setVideo(null);
        setCaption('');
        setIsPrivate(false);
        setHiddenFromFollowers([]);
      };
    }, [route?.params?.hiddenFromFollowers, navigation])
  );

  const showImagePickerOptions = () => {
    setModalType('image');
    setModalVisible(true);
  };

  const pickImageFromCamera = () => {
    setVideo(null);
    ImagePicker.openCamera({
      width: 1000,
      height: 1000,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
      cropperStatusBarColor: '#000000',
      cropperToolbarColor: '#000000',
      cropperToolbarWidgetColor: '#ffffff',
      cropperToolbarTitle: 'Resmi Düzenle',
      enableRotationGesture: true,
      freeStyleCropEnabled: false,
      hideBottomControls: false,
    })
      .then((image) => {
        const img = image as any;
        if (img.data) {
          const base64Image = `data:${img.mime};base64,${img.data}`;
          setImage(base64Image);
        }
      })
      .catch((error) => {
        if (error.message !== 'User cancelled image selection' && error.message !== 'User cancelled') {
          console.error('Kamera hatası:', error);
          showToast('Resim çekilemedi', 'error');
        }
      });
  };

  const pickImageFromGallery = () => {
    setVideo(null);
    ImagePicker.openPicker({
      width: 1000,
      height: 1000,
      cropping: true,
      compressImageQuality: 0.8,
      includeBase64: true,
      cropperStatusBarColor: '#000000',
      cropperToolbarColor: '#000000',
      cropperToolbarWidgetColor: '#ffffff',
      cropperToolbarTitle: 'Resmi Düzenle',
      enableRotationGesture: true,
      freeStyleCropEnabled: false,
      hideBottomControls: false,
    })
      .then((image) => {
        const img = image as any;
        if (img.data) {
          const base64Image = `data:${img.mime};base64,${img.data}`;
          setImage(base64Image);
        }
      })
      .catch((error) => {
        if (error.message !== 'User cancelled image selection') {
          console.error('Resim seçme hatası:', error);
          showToast('Resim seçilemedi', 'error');
        }
      });
  };

  const pickImage = () => {
    showImagePickerOptions();
  };

  const pickVideoFromCamera = () => {
    setImage(null);
    ImagePicker.openCamera({
      mediaType: 'video',
      videoQuality: 'high',
    })
      .then((video) => {
        if (video.path) {
          setVideo(video.path);
        }
      })
      .catch((error) => {
        if (error.message !== 'User cancelled image selection' && error.message !== 'User cancelled') {
          console.error('Kamera video hatası:', error);
          showToast('Video çekilemedi', 'error');
        }
      });
  };

  const pickVideoFromGallery = () => {
    setImage(null);
    ImagePicker.openPicker({
      mediaType: 'video',
    })
      .then((video) => {
        if (video.path) {
          setVideo(video.path);
        }
      })
      .catch((error) => {
        if (error.message !== 'User cancelled image selection') {
          console.error('Video seçme hatası:', error);
          showToast('Video seçilemedi', 'error');
        }
      });
  };

  const pickVideo = () => {
    setModalType('video');
    setModalVisible(true);
  };

  const handlePost = async () => {
    if (!image && !video) {
      showToast('Lütfen fotoğraf veya video seçin', 'warning');
      return;
    }

    try {
      setLoading(true);
      await postService.createPost(image || undefined, caption, isPrivate, hiddenFromFollowers, video || undefined);

      // Post başarıyla paylaşıldıktan sonra state'leri temizle
      setImage(null);
      setVideo(null);
      setCaption('');
      setIsPrivate(false);
      setHiddenFromFollowers([]);

      showToast('Gönderi paylaşıldı', 'success');
      navigation.goBack();
    } catch (error) {
      console.error('Gönderi paylaşma hatası:', error);
      showToast('Gönderi paylaşılamadı', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>İptal</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Yeni Gönderi</Text>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#0095f6" />
          ) : (
            <Text style={styles.share}>Paylaş</Text>
          )}
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
              <Icon name="close-circle-outline" size={26} color="#fff" />
              <Text style={styles.changeMediaText}>Medyayı Değiştir</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            <Icon name="cloud-upload-outline" size={68} color="#9C27B0" />
            <Text style={styles.uploadTitle}>Fotoğraf veya Video Seç</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <Icon name="images-outline" size={36} color="#9C27B0" />
                <Text style={styles.mediaButtonText}>Fotoğraf</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                <Icon name="play-circle-outline" size={36} color="#9C27B0" />
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
              <Icon name="lock-closed-outline" size={24} color="#424242" />
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
              <Icon name="eye-off-outline" size={22} color="#9C27B0" />
              <Text style={styles.manageButtonText}>
                Belirli Takipçilerden Gizle {hiddenFromFollowers.length > 0 && `(${hiddenFromFollowers.length})`}
              </Text>
              <Icon name="chevron-forward-outline" size={22} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <MediaPickerModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalType === 'image' ? 'Fotoğraf Seç' : 'Video Seç'}
        onSelectCamera={modalType === 'image' ? pickImageFromCamera : pickVideoFromCamera}
        onSelectGallery={modalType === 'image' ? pickImageFromGallery : pickVideoFromGallery}
      />
    </SafeAreaView>
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
