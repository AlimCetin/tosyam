import React, { useState, useEffect, useCallback } from 'react';
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
import Video from 'react-native-video';
import { reportService } from '../services/reportService';
import { adminService } from '../services/adminService';
import { Report } from '../types';

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('temporary');
  const [banUntil, setBanUntil] = useState('');

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterType, filterPriority]);

  // Ekrana geri döndüğünde modal'ı tekrar aç
  useFocusEffect(
    useCallback(() => {
      if (selectedReport && !modalVisible) {
        // Kısa bir gecikme ile modal'ı aç (navigation animasyonu tamamlandıktan sonra)
        const timer = setTimeout(() => {
          setModalVisible(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [selectedReport, modalVisible])
  );

  const loadReports = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await reportService.getReports(
        pageNum,
        20,
        filterStatus || undefined,
        filterType || undefined,
        filterPriority || undefined,
      );
      if (pageNum === 1) {
        setReports(response.reports || []);
      } else {
        setReports((prev) => [...prev, ...(response.reports || [])]);
      }
      setHasMore(response.pagination?.hasMore || false);
    } catch (error) {
      console.error('Şikayetler yüklenemedi:', error);
      Alert.alert('Hata', 'Şikayetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadReports(1);
    setRefreshing(false);
  };

  const handleReportPress = async (report: Report) => {
    try {
      const reportId = (report as any).id || (report as any)._id;
      if (!reportId) {
        Alert.alert('Hata', 'Şikayet ID bulunamadı');
        return;
      }
      const fullReport = await reportService.getReportById(reportId);
      setSelectedReport(fullReport);
      setAdminNote(fullReport.adminNote || '');
      setModalVisible(true);
    } catch (error) {
      console.error('Şikayet detayı yüklenemedi:', error);
      Alert.alert('Hata', 'Şikayet detayı yüklenemedi');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedReport) return;

    try {
      const reportId = (selectedReport as any).id || (selectedReport as any)._id;
      if (!reportId) {
        Alert.alert('Hata', 'Şikayet ID bulunamadı');
        return;
      }
      await reportService.updateReport(reportId, {
        status,
        adminNote: adminNote || undefined,
      });
      Alert.alert('Başarılı', 'Şikayet durumu güncellendi');
      setModalVisible(false);
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      Alert.alert('Hata', 'Şikayet güncellenemedi');
    }
  };

  const getReportedUserId = () => {
    if (!selectedReport || !(selectedReport as any).reportedItem) return null;

    const reportedItem = (selectedReport as any).reportedItem;

    // Şikayet tipine göre kullanıcı ID'sini bul
    if (selectedReport.type === 'user') {
      return reportedItem.id;
    } else if (selectedReport.type === 'post') {
      return reportedItem.userId;
    } else if (selectedReport.type === 'comment') {
      return reportedItem.userId;
    } else if (selectedReport.type === 'message') {
      return reportedItem.senderId;
    }

    return null;
  };

  const handleBanUser = async () => {
    const userId = getReportedUserId();
    if (!userId) {
      Alert.alert('Hata', 'Şikayet edilen kullanıcı bulunamadı');
      return;
    }

    try {
      const banData: any = {
        reason: banReason || `Şikayet nedeni: ${selectedReport?.reason || 'Belirtilmemiş'}`,
      };

      if (banType === 'permanent') {
        banData.isPermanent = true;
      } else if (banUntil) {
        // Tarihi ISO formatına çevir
        const banDate = new Date(banUntil);
        if (isNaN(banDate.getTime())) {
          Alert.alert('Hata', 'Geçersiz tarih formatı. Lütfen YYYY-MM-DD formatında girin.');
          return;
        }
        // Geçmiş tarih kontrolü
        if (banDate <= new Date()) {
          Alert.alert('Hata', 'Ban bitiş tarihi bugünden sonra olmalıdır.');
          return;
        }
        banData.bannedUntil = banDate.toISOString();
      } else {
        Alert.alert('Hata', 'Ban süresi belirtin veya kalıcı ban seçin');
        return;
      }

      await adminService.banUser(userId, banData);
      
      // Şikayeti resolved olarak işaretle
      const reportId = (selectedReport as any).id || (selectedReport as any)._id;
      if (reportId) {
        await reportService.updateReport(reportId, {
          status: 'resolved',
          adminNote: adminNote || `Kullanıcı banlandı: ${banReason || 'Şikayet nedeniyle'}`,
        });
      }

      Alert.alert('Başarılı', 'Kullanıcı banlandı ve şikayet çözüldü olarak işaretlendi');
      setBanModalVisible(false);
      setModalVisible(false);
      setSelectedReport(null);
      setBanReason('');
      setBanUntil('');
      loadReports();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Kullanıcı banlanamadı');
    }
  };

  const openBanModal = () => {
    const userId = getReportedUserId();
    if (!userId) {
      Alert.alert('Hata', 'Şikayet edilen kullanıcı bulunamadı');
      return;
    }
    setBanModalVisible(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#e91e63';
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      default:
        return '#4caf50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'in_review':
        return '#2196f3';
      case 'resolved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      default:
        return '#8e8e8e';
    }
  };

  const renderReport = ({ item }: { item: Report }) => {
    const reportId = (item as any).id || (item as any)._id;
    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => handleReportPress(item)}
        activeOpacity={0.7}>
        <View style={styles.reportHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority?.toUpperCase() || 'MEDIUM'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status === 'pending' ? 'Beklemede' :
               item.status === 'in_review' ? 'İnceleniyor' :
               item.status === 'resolved' ? 'Çözüldü' : 'Reddedildi'}
            </Text>
          </View>
        </View>
        <Text style={styles.reportType}>Tür: {item.type} - {item.reason}</Text>
        {item.description && (
          <Text style={styles.reportDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.reportFooter}>
          <Text style={styles.reportCount}>{(item as any).reportCount || 1} şikayet</Text>
          <Text style={styles.reportDate}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'pending' && styles.filterChipActive]}
            onPress={() => setFilterStatus('pending')}>
            <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
              Bekleyen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'in_review' && styles.filterChipActive]}
            onPress={() => setFilterStatus('in_review')}>
            <Text style={[styles.filterText, filterStatus === 'in_review' && styles.filterTextActive]}>
              İnceleniyor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterStatus === 'resolved' && styles.filterChipActive]}
            onPress={() => setFilterStatus('resolved')}>
            <Text style={[styles.filterText, filterStatus === 'resolved' && styles.filterTextActive]}>
              Çözülen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterPriority === 'urgent' && styles.filterChipActive]}
            onPress={() => setFilterPriority(filterPriority === 'urgent' ? '' : 'urgent')}>
            <Text style={[styles.filterText, filterPriority === 'urgent' && styles.filterTextActive]}>
              Acil
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading && reports.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : (
        <FlatList
        data={reports}
        keyExtractor={(item) => (item as any).id || (item as any)._id || String(Math.random())}
        renderItem={renderReport}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => {
            if (hasMore && !loading) {
              const nextPage = page + 1;
              setPage(nextPage);
              loadReports(nextPage);
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Şikayet bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* Report Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedReport(null);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedReport && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Şikayet Detayı</Text>
                  <TouchableOpacity onPress={() => {
                    setModalVisible(false);
                    setSelectedReport(null);
                  }}>
                    <Icon name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tür:</Text>
                    <Text style={styles.detailValue}>
                      {selectedReport.type === 'post' ? 'Gönderi' :
                       selectedReport.type === 'user' ? 'Kullanıcı' :
                       selectedReport.type === 'comment' ? 'Yorum' :
                       selectedReport.type === 'message' ? 'Mesaj' : selectedReport.type}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sebep:</Text>
                    <Text style={styles.detailValue}>
                      {selectedReport.reason === 'spam' ? 'Spam' :
                       selectedReport.reason === 'harassment' ? 'Taciz' :
                       selectedReport.reason === 'inappropriate_content' ? 'Uygunsuz İçerik' :
                       selectedReport.reason === 'copyright' ? 'Telif Hakkı' :
                       selectedReport.reason === 'fake_news' ? 'Sahte Bilgi' :
                       selectedReport.reason === 'hate_speech' ? 'Nefret Söylemi' :
                       selectedReport.reason === 'other' ? 'Diğer' : selectedReport.reason}
                    </Text>
                  </View>
                  {selectedReport.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Açıklama:</Text>
                      <Text style={styles.detailValue}>{selectedReport.description}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Şikayet Sayısı:</Text>
                    <Text style={styles.detailValue}>{(selectedReport as any).reportCount || 1}</Text>
                  </View>

                  {/* Şikayet Edilen İçerik */}
                  {(selectedReport as any).reportedItem && (
                    <View style={styles.reportedItemContainer}>
                      <Text style={styles.sectionTitle}>Şikayet Edilen İçerik:</Text>
                      
                      {selectedReport.type === 'post' && (selectedReport as any).reportedItem && (
                        <View style={styles.postPreview}>
                          {(selectedReport as any).reportedItem.video ? (
                            <Video
                              source={{ uri: (selectedReport as any).reportedItem.video }}
                              style={styles.postMedia}
                              resizeMode="contain"
                              paused
                              controls={false}
                            />
                          ) : (selectedReport as any).reportedItem.image ? (
                            <Image
                              source={{ uri: (selectedReport as any).reportedItem.image }}
                              style={styles.postMedia}
                            />
                          ) : null}
                          
                          {(selectedReport as any).reportedItem.caption && (
                            <View style={styles.postCaption}>
                              <Text style={styles.postCaptionText}>
                                {(selectedReport as any).reportedItem.caption}
                              </Text>
                            </View>
                          )}
                          
                          <TouchableOpacity
                            style={styles.viewPostButton}
                            onPress={() => {
                              if ((selectedReport as any).reportedItem?.id) {
                                setModalVisible(false);
                                setTimeout(() => {
                                  navigation.navigate('PostDetail', { 
                                    postId: (selectedReport as any).reportedItem.id 
                                  });
                                }, 100);
                              }
                            }}>
                            <Text style={styles.viewPostButtonText}>Gönderiyi Görüntüle</Text>
                            <Icon name="arrow-forward" size={16} color="#0095f6" />
                          </TouchableOpacity>
                        </View>
                      )}

                      {selectedReport.type === 'user' && (selectedReport as any).reportedItem && (
                        <View style={styles.userPreview}>
                          <Image
                            source={{ 
                              uri: (selectedReport as any).reportedItem.avatar || 'https://via.placeholder.com/80' 
                            }}
                            style={styles.userPreviewAvatar}
                          />
                          <Text style={styles.userPreviewName}>
                            {(selectedReport as any).reportedItem.fullName || 'Bilinmeyen Kullanıcı'}
                          </Text>
                          {(selectedReport as any).reportedItem.bio && (
                            <Text style={styles.userPreviewBio}>
                              {(selectedReport as any).reportedItem.bio}
                            </Text>
                          )}
                          <TouchableOpacity
                            style={styles.viewUserButton}
                            onPress={() => {
                              if ((selectedReport as any).reportedItem?.id) {
                                setModalVisible(false);
                                setTimeout(() => {
                                  navigation.navigate('Profile', { 
                                    userId: (selectedReport as any).reportedItem.id 
                                  });
                                }, 100);
                              }
                            }}>
                            <Text style={styles.viewUserButtonText}>Profili Görüntüle</Text>
                            <Icon name="arrow-forward" size={16} color="#0095f6" />
                          </TouchableOpacity>
                        </View>
                      )}

                      {(selectedReport.type === 'comment' || selectedReport.type === 'message') && (selectedReport as any).reportedItem && (
                        <View style={styles.textPreview}>
                          <Text style={styles.textPreviewLabel}>
                            {selectedReport.type === 'comment' ? 'Yorum İçeriği:' : 'Mesaj İçeriği:'}
                          </Text>
                          <View style={styles.textContentBox}>
                            <Text style={styles.textContent}>
                              {(selectedReport as any).reportedItem.text || (selectedReport as any).reportedItem.content || 'İçerik bulunamadı'}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Şikayet Eden Kullanıcı */}
                  {(selectedReport as any).reporter && (
                    <View style={styles.reporterContainer}>
                      <Text style={styles.sectionTitle}>Şikayet Eden:</Text>
                      <View style={styles.reporterInfo}>
                        <Image
                          source={{ 
                            uri: (selectedReport as any).reporter.avatar || 'https://via.placeholder.com/50' 
                          }}
                          style={styles.reporterAvatar}
                        />
                        <Text style={styles.reporterName}>
                          {(selectedReport as any).reporter.fullName || 'Bilinmeyen'}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Text style={styles.noteLabel}>Admin Notu:</Text>
                  <TextInput
                    style={styles.noteInput}
                    value={adminNote}
                    onChangeText={setAdminNote}
                    placeholder="Admin notu ekleyin..."
                    multiline
                    numberOfLines={4}
                  />
                </ScrollView>

                <View style={styles.modalActions}>
                  <View style={styles.actionButtonRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton, styles.halfWidthButton]}
                      onPress={() => handleUpdateStatus('rejected')}>
                      <Text style={styles.actionButtonText}>Reddet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.resolveButton, styles.halfWidthButton]}
                      onPress={() => handleUpdateStatus('resolved')}>
                      <Text style={[styles.actionButtonText, styles.resolveButtonText]}>Çözüldü</Text>
                    </TouchableOpacity>
                  </View>
                  {getReportedUserId() && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.banButton, styles.fullWidthButton, styles.centeredBanButton]}
                      onPress={openBanModal}>
                      <Icon name="ban-outline" size={20} color="#fff" />
                      <Text style={[styles.actionButtonText, styles.banButtonText]}>Kullanıcıyı Banla</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Ban User Modal */}
      <Modal
        visible={banModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBanModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kullanıcıyı Banla</Text>
              <TouchableOpacity onPress={() => setBanModalVisible(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.noteLabel}>Ban Türü:</Text>
              <View style={styles.banTypeContainer}>
                <TouchableOpacity
                  style={[styles.banTypeButton, banType === 'temporary' && styles.banTypeButtonActive]}
                  onPress={() => setBanType('temporary')}>
                  <Text style={[styles.banTypeText, banType === 'temporary' && styles.banTypeTextActive]}>
                    Geçici Ban
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.banTypeButton, banType === 'permanent' && styles.banTypeButtonActive]}
                  onPress={() => setBanType('permanent')}>
                  <Text style={[styles.banTypeText, banType === 'permanent' && styles.banTypeTextActive]}>
                    Kalıcı Ban
                  </Text>
                </TouchableOpacity>
              </View>

              {banType === 'temporary' && (
                <>
                  <Text style={styles.noteLabel}>Ban Bitiş Tarihi:</Text>
                  <TextInput
                    style={styles.noteInput}
                    value={banUntil}
                    onChangeText={setBanUntil}
                    placeholder="YYYY-MM-DD formatında (örn: 2026-01-15)"
                    autoCapitalize="none"
                  />
                  <Text style={styles.helpText}>
                    Örnek formatlar: 2026-01-15 (7 gün sonra), 2026-02-09 (1 ay sonra)
                  </Text>
                </>
              )}

              <Text style={styles.noteLabel}>Ban Sebebi:</Text>
              <TextInput
                style={styles.noteInput}
                value={banReason}
                onChangeText={setBanReason}
                placeholder="Ban sebebini girin..."
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <View style={styles.actionButtonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton, styles.halfWidthButton]}
                  onPress={() => setBanModalVisible(false)}>
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.banConfirmButton, styles.halfWidthButton]}
                  onPress={handleBanUser}>
                  <Text style={[styles.actionButtonText, styles.banButtonText]}>Banla</Text>
                </TouchableOpacity>
              </View>
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
  filters: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  filterScroll: {
    paddingHorizontal: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0095f6',
  },
  filterText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  reportCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  reportDescription: {
    fontSize: 12,
    color: '#8e8e8e',
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportCount: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  reportDate: {
    fontSize: 12,
    color: '#8e8e8e',
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
    maxHeight: '80%',
    paddingBottom: 20,
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
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8e8e8e',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#000',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalActions: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fullWidthButton: {
    width: '100%',
    flex: 0,
  },
  halfWidthButton: {
    flex: 1,
  },
  centeredBanButton: {
    marginTop: 8,
    alignSelf: 'center',
    maxWidth: '100%',
  },
  rejectButton: {
    backgroundColor: '#f0f0f0',
  },
  resolveButton: {
    backgroundColor: '#0095f6',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  resolveButtonText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#000',
  },
  reportedItemContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  postPreview: {
    marginTop: 8,
  },
  postMedia: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  postCaption: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 8,
  },
  postCaptionText: {
    fontSize: 14,
    color: '#000',
  },
  viewPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#0095f6',
    borderRadius: 6,
    gap: 6,
  },
  viewPostButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userPreview: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
  },
  userPreviewAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userPreviewBio: {
    fontSize: 14,
    color: '#8e8e8e',
    textAlign: 'center',
    marginBottom: 12,
  },
  viewUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#0095f6',
    borderRadius: 6,
    gap: 6,
  },
  viewUserButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  textPreview: {
    marginTop: 8,
  },
  textPreviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  textContentBox: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  reporterContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b3d9ff',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  reporterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  banButton: {
    backgroundColor: '#f44336',
  },
  banButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  banConfirmButton: {
    backgroundColor: '#f44336',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  banTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  banTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  banTypeButtonActive: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  banTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  banTypeTextActive: {
    color: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 4,
    marginBottom: 12,
  },
});

