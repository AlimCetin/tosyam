import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { adService } from '../services/adService';
import { Ad } from '../types';
import ImagePicker from 'react-native-image-crop-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const AdsManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [adType, setAdType] = useState<'image' | 'video'>('image');
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>('draft');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxImpressions, setMaxImpressions] = useState('');
  const [budget, setBudget] = useState('');
  const [userRole, setUserRole] = useState<string>('user');
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkAccess();
    }, [])
  );

  const checkAccess = async () => {
    try {
      let currentUser: any = authService.getCurrentUser();
      if (!currentUser || !currentUser.role) {
        currentUser = await userService.getCurrentUser();
      }
      const role = currentUser?.role || 'user';
      setUserRole(role);
      
      // Sadece admin ve super_admin erişebilir
      if (role !== 'admin' && role !== 'super_admin') {
        setHasAccess(false);
        Alert.alert(
          'Erişim Reddedildi',
          'Bu sayfaya sadece adminler erişebilir.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ]
        );
        return;
      }
      
      // Erişim varsa reklamları yükle
      setHasAccess(true);
      loadAds();
    } catch (error) {
      console.error('Erişim kontrolü başarısız:', error);
      setHasAccess(false);
      Alert.alert('Hata', 'Erişim kontrolü yapılamadı', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    }
  };

  useEffect(() => {
    // Erişim varsa ve filterStatus değiştiğinde yükle
    if (hasAccess) {
      loadAds();
    }
  }, [filterStatus]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const response = await adService.getAds(1, 50, filterStatus || undefined);
      setAds(response.ads || []);
    } catch (error) {
      console.error('Reklamlar yüklenemedi:', error);
      Alert.alert('Hata', 'Reklamlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAds();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingAd(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setDescription(ad.description || '');
    setMediaUrl(ad.mediaUrl);
    setLinkUrl(ad.linkUrl);
    setAdType(ad.type);
    setStatus(ad.status as any);
    const startDateStr = typeof ad.startDate === 'string' ? ad.startDate : new Date(ad.startDate).toISOString();
    const endDateStr = typeof ad.endDate === 'string' ? ad.endDate : new Date(ad.endDate).toISOString();
    setStartDate(startDateStr.split('T')[0]);
    setEndDate(endDateStr.split('T')[0]);
    setMaxImpressions(ad.maxImpressions?.toString() || '');
    setBudget(ad.budget?.toString() || '');
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setLinkUrl('');
    setAdType('image');
    setStatus('draft');
    setStartDate('');
    setEndDate('');
    setMaxImpressions('');
    setBudget('');
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 1000,
      height: 1000,
      cropping: true,
      compressImageQuality: 0.8,
    })
      .then((image) => {
        if (image.path) {
          setMediaUrl(image.path);
          setAdType('image');
        }
      })
      .catch(() => {});
  };

  const pickVideo = () => {
    launchImageLibrary({ mediaType: 'video', videoQuality: 'high', selectionLimit: 1 }, (response) => {
      const asset = response.assets && response.assets[0];
      if (asset?.uri) {
        setMediaUrl(asset.uri);
        setAdType('video');
      }
    });
  };

  const handleSave = async () => {
    if (!title || !mediaUrl || !linkUrl || !startDate || !endDate) {
      Alert.alert('Hata', 'Lütfen tüm gerekli alanları doldurun');
      return;
    }

    try {
      const adData = {
        title,
        type: adType,
        mediaUrl,
        linkUrl,
        description: description || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status: status as any,
        maxImpressions: maxImpressions ? parseInt(maxImpressions) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
      };

      if (editingAd) {
        const adId = (editingAd as any).id || (editingAd as any)._id;
        if (!adId) {
          Alert.alert('Hata', 'Reklam ID bulunamadı');
          return;
        }
        await adService.updateAd(adId, adData);
        Alert.alert('Başarılı', 'Reklam güncellendi');
      } else {
        await adService.createAd(adData);
        Alert.alert('Başarılı', 'Reklam oluşturuldu');
      }

      setModalVisible(false);
      loadAds();
    } catch (error) {
      Alert.alert('Hata', 'Reklam kaydedilemedi');
    }
  };

  const handleDelete = async (ad: Ad) => {
    Alert.alert('Sil', 'Reklamı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const adId = (ad as any).id || (ad as any)._id;
            if (!adId) {
              Alert.alert('Hata', 'Reklam ID bulunamadı');
              return;
            }
            await adService.deleteAd(adId);
            Alert.alert('Başarılı', 'Reklam silindi');
            loadAds();
          } catch (error) {
            Alert.alert('Hata', 'Reklam silinemedi');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'paused':
        return '#ff9800';
      case 'expired':
        return '#f44336';
      default:
        return '#8e8e8e';
    }
  };

  const renderAd = ({ item }: { item: Ad }) => (
    <View style={styles.adCard}>
      <View style={styles.adHeader}>
        <Text style={styles.adTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Aktif' :
             item.status === 'paused' ? 'Duraklatıldı' :
             item.status === 'expired' ? 'Süresi Doldu' : 'Taslak'}
          </Text>
        </View>
      </View>
      
      {item.mediaUrl && (
        <Image source={{ uri: item.mediaUrl }} style={styles.adImage} />
      )}

      <View style={styles.adStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.impressionCount || 0}</Text>
          <Text style={styles.statLabel}>Gösterim</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.clickCount || 0}</Text>
          <Text style={styles.statLabel}>Tıklama</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {item.impressionCount > 0
              ? ((item.clickCount / item.impressionCount) * 100).toFixed(2)
              : 0}%
          </Text>
          <Text style={styles.statLabel}>CTR</Text>
        </View>
      </View>

      <View style={styles.adActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}>
          <Icon name="create-outline" size={20} color="#0095f6" />
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}>
          <Icon name="trash-outline" size={20} color="#f44336" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterStatus('')}>
          <Text style={styles.filterText}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterStatus('active')}>
          <Text style={styles.filterText}>Aktif</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterStatus('paused')}>
          <Text style={styles.filterText}>Duraklatıldı</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={openCreateModal}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : (
        <FlatList
          data={ads}
          keyExtractor={(item) => (item as any).id || (item as any)._id || String(Math.random())}
          renderItem={renderAd}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Reklam bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAd ? 'Reklam Düzenle' : 'Yeni Reklam'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Başlık *"
                value={title}
                onChangeText={setTitle}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Açıklama"
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                  <Icon name="image-outline" size={24} color="#0095f6" />
                  <Text>Resim Seç</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                  <Icon name="videocam-outline" size={24} color="#0095f6" />
                  <Text>Video Seç</Text>
                </TouchableOpacity>
              </View>

              {mediaUrl && (
                <Image source={{ uri: mediaUrl }} style={styles.previewImage} />
              )}

              <TextInput
                style={styles.input}
                placeholder="Link URL *"
                value={linkUrl}
                onChangeText={setLinkUrl}
                keyboardType="url"
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Başlangıç Tarihi (YYYY-MM-DD) *"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Bitiş Tarihi (YYYY-MM-DD) *"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Maks. Gösterim"
                  value={maxImpressions}
                  onChangeText={setMaxImpressions}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Bütçe"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Durum:</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'draft' && styles.statusButtonActive]}
                  onPress={() => setStatus('draft')}>
                  <Text style={status === 'draft' ? styles.statusButtonTextActive : styles.statusButtonText}>
                    Taslak
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'paused' && styles.statusButtonActive]}
                  onPress={() => setStatus('paused')}>
                  <Text style={status === 'paused' ? styles.statusButtonTextActive : styles.statusButtonText}>
                    Duraklatıldı
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'active' && styles.statusButtonActive]}
                  onPress={() => setStatus('active')}>
                  <Text style={status === 'active' ? styles.statusButtonTextActive : styles.statusButtonText}>
                    Aktif
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterText: {
    fontSize: 14,
    color: '#000',
  },
  createButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  adImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  adStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  adActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0095f6',
    gap: 6,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0095f6',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalBody: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#0095f6',
    borderRadius: 8,
    gap: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#000',
  },
  statusButtonTextActive: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0095f6',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

