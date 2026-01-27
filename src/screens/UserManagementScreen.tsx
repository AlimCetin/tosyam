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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services/adminService';
import { User } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { SelectionModal } from '../components/SelectionModal';

export const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterBanned, setFilterBanned] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('temporary');
  const [banUntil, setBanUntil] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  useEffect(() => {
    loadUserRole();
    loadUsers();
  }, [searchQuery, filterRole, filterBanned]);

  const loadUserRole = async () => {
    try {
      let currentUser: any = authService.getCurrentUser();
      if (!currentUser || !currentUser.role) {
        currentUser = await userService.getCurrentUser();
      }
      const role = currentUser?.role || 'user';
      setIsAdmin(role === 'admin' || role === 'super_admin');
    } catch (error) {
      console.error('Kullanıcı rolü yüklenemedi:', error);
    }
  };

  const loadUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(
        pageNum,
        20,
        searchQuery || undefined,
        filterRole || undefined,
        filterBanned,
      );
      if (pageNum === 1) {
        setUsers(response.users || []);
      } else {
        setUsers((prev) => [...prev, ...(response.users || [])]);
      }
      setHasMore(response.pagination?.hasMore || false);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      showToast('Kullanıcılar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadUsers(1);
    setRefreshing(false);
  };

  const handleUserPress = async (user: User) => {
    try {
      const fullUser = await adminService.getUserById(user.id);
      setSelectedUser(fullUser);
      setModalVisible(true);
    } catch (error) {
      console.error('Kullanıcı detayı yüklenemedi:', error);
    }
  };

  const handleBan = async () => {
    if (!selectedUser) return;

    try {
      const userId = (selectedUser as any).id || (selectedUser as any)._id;
      if (!userId) {
        showToast('Kullanıcı ID bulunamadı', 'error');
        return;
      }
      const banData: any = {
        reason: banReason || undefined,
      };

      if (banType === 'permanent') {
        banData.isPermanent = true;
      } else if (banUntil) {
        banData.bannedUntil = banUntil;
      } else {
        showToast('Ban süresi belirtin veya kalıcı ban seçin', 'warning');
        return;
      }

      await adminService.banUser(userId, banData);
      showToast('Kullanıcı banlandı', 'success');
      setModalVisible(false);
      loadUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Kullanıcı banlanamadı', 'error');
    }
  };

  const handleUnban = async () => {
    if (!selectedUser) return;

    try {
      const userId = (selectedUser as any).id || (selectedUser as any)._id;
      if (!userId) {
        showToast('Kullanıcı ID bulunamadı', 'error');
        return;
      }
      await adminService.unbanUser(userId);
      showToast('Kullanıcının banı kaldırıldı', 'success');
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      showToast('Ban kaldırılamadı', 'error');
    }
  };

  const handleWarn = async () => {
    if (!selectedUser) return;

    try {
      const userId = (selectedUser as any).id || (selectedUser as any)._id;
      if (!userId) {
        showToast('Kullanıcı ID bulunamadı', 'error');
        return;
      }
      await adminService.warnUser(userId, banReason || undefined);
      showToast('Kullanıcıya uyarı verildi', 'success');
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      showToast('Uyarı verilemedi', 'error');
    }
  };

  const handleRoleChange = async (role: string) => {
    if (!selectedUser) return;

    try {
      const userId = (selectedUser as any).id || (selectedUser as any)._id;
      if (!userId) {
        showToast('Kullanıcı ID bulunamadı', 'error');
        return;
      }
      await adminService.changeUserRole(userId, role);
      showToast('Kullanıcı rolü güncellendi', 'success');
      setModalVisible(false);
      loadUsers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Rol değiştirilemedi', 'error');
    }
  };

  const isUserBanned = (user: User) => {
    if (user.isPermanentlyBanned) return true;
    if (user.bannedUntil) {
      return new Date(user.bannedUntil) > new Date();
    }
    return false;
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}>
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userDetails}>
          {item.role || 'user'} • {item.postCount || 0} gönderi
          {isUserBanned(item) && ' • 🚫 Banlı'}
          {item.warningCount && item.warningCount > 0 && ` • ⚠️ ${item.warningCount} uyarı`}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#8e8e8e" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filterBanned === false && styles.filterChipActive]}
            onPress={() => setFilterBanned(filterBanned === false ? undefined : false)}>
            <Text style={[styles.filterText, filterBanned === false && styles.filterTextActive]}>
              Aktif
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filterBanned === true && styles.filterChipActive]}
            onPress={() => setFilterBanned(filterBanned === true ? undefined : true)}>
            <Text style={[styles.filterText, filterBanned === true && styles.filterTextActive]}>
              Banlı
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && users.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => (item as any).id || (item as any)._id || String(Math.random())}
          renderItem={renderUser}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={() => {
            if (hasMore && !loading) {
              const nextPage = page + 1;
              setPage(nextPage);
              loadUsers(nextPage);
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
            </View>
          }
        />
      )}

      {/* User Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Kullanıcı Yönetimi</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.userDetailHeader}>
                    <Image
                      source={{ uri: selectedUser.avatar || 'https://via.placeholder.com/80' }}
                      style={styles.detailAvatar}
                    />
                    <View>
                      <Text style={styles.detailUserName}>{selectedUser.fullName}</Text>
                      <Text style={styles.detailUserRole}>{selectedUser.role || 'user'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{selectedUser.postCount || 0}</Text>
                      <Text style={styles.statLabel}>Gönderi</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{selectedUser.warningCount || 0}</Text>
                      <Text style={styles.statLabel}>Uyarı</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {isUserBanned(selectedUser) ? 'Evet' : 'Hayır'}
                      </Text>
                      <Text style={styles.statLabel}>Banlı</Text>
                    </View>
                  </View>

                  <TextInput
                    style={styles.reasonInput}
                    placeholder="Sebep (opsiyonel)"
                    value={banReason}
                    onChangeText={setBanReason}
                    multiline
                  />

                  {isUserBanned(selectedUser) ? (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.unbanButton]}
                      onPress={handleUnban}>
                      <Text style={styles.actionButtonText}>Banı Kaldır</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <View style={styles.banOptions}>
                        <TouchableOpacity
                          style={[styles.banOption, banType === 'temporary' && styles.banOptionActive]}
                          onPress={() => setBanType('temporary')}>
                          <Text style={banType === 'temporary' ? styles.banOptionTextActive : styles.banOptionText}>
                            Geçici
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.banOption, banType === 'permanent' && styles.banOptionActive]}
                          onPress={() => setBanType('permanent')}>
                          <Text style={banType === 'permanent' ? styles.banOptionTextActive : styles.banOptionText}>
                            Kalıcı
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {banType === 'temporary' && (
                        <TextInput
                          style={styles.dateInput}
                          placeholder="Ban bitiş tarihi (YYYY-MM-DD)"
                          value={banUntil}
                          onChangeText={setBanUntil}
                        />
                      )}

                      <TouchableOpacity
                        style={[styles.actionButton, styles.warnButton]}
                        onPress={handleWarn}>
                        <Text style={styles.actionButtonText}>Uyarı Ver</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.banButton]}
                        onPress={handleBan}>
                        <Text style={[styles.actionButtonText, styles.banButtonText]}>Banla</Text>
                      </TouchableOpacity>

                      {isAdmin && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.roleButton]}
                          onPress={() => setRoleModalVisible(true)}>
                          <Text style={styles.actionButtonText}>Rol Değiştir</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <SelectionModal
        isVisible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        title="Rol Değiştir"
        onSelect={handleRoleChange}
        options={[
          { label: 'Kullanıcı', value: 'user', icon: 'person-outline', color: '#757575' },
          { label: 'Moderatör', value: 'moderator', icon: 'shield-outline', color: '#0095f6' },
          { label: 'Admin', value: 'admin', icon: 'shield-half-outline', color: '#9C27B0' },
        ]}
      />
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
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userDetails: {
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
  userDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  detailUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  detailUserRole: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  banOptions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  banOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    alignItems: 'center',
  },
  banOptionActive: {
    backgroundColor: '#0095f6',
    borderColor: '#0095f6',
  },
  banOptionText: {
    fontSize: 14,
    color: '#000',
  },
  banOptionTextActive: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  warnButton: {
    backgroundColor: '#ff9800',
  },
  banButton: {
    backgroundColor: '#f44336',
  },
  unbanButton: {
    backgroundColor: '#4caf50',
  },
  roleButton: {
    backgroundColor: '#2196f3',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  banButtonText: {
    color: '#fff',
  },
});

