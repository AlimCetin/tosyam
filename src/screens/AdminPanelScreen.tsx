import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { adminService } from '../services/adminService';
import { reportService } from '../services/reportService';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const AdminPanelScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [reportStats, setReportStats] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserRole();
    loadDashboard();
  }, []);

  const loadUserRole = async () => {
    try {
      let currentUser: any = authService.getCurrentUser();
      if (!currentUser || !currentUser.role) {
        currentUser = await userService.getCurrentUser();
      }
      const role = currentUser?.role || 'user';
      setUserRole(role);
      setIsAdmin(role === 'admin' || role === 'super_admin');
    } catch (error) {
      console.error('Kullanıcı rolü yüklenemedi:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboard, reports] = await Promise.all([
        adminService.getDashboard(),
        reportService.getStatistics(),
      ]);
      setDashboardStats(dashboard);
      setReportStats(reports);
    } catch (error) {
      console.error('Dashboard yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Dashboard Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genel İstatistikler</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScrollView}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Icon name="people-outline" size={24} color="#0095f6" />
              <Text style={styles.statValue}>{dashboardStats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="person-add-outline" size={24} color="#4caf50" />
              <Text style={styles.statValue}>{dashboardStats?.newUsersToday || 0}</Text>
              <Text style={styles.statLabel}>Bugün Yeni</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="ban-outline" size={24} color="#f44336" />
              <Text style={styles.statValue}>{dashboardStats?.bannedUsers || 0}</Text>
              <Text style={styles.statLabel}>Banlı</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="warning-outline" size={24} color="#ff9800" />
              <Text style={styles.statValue}>{dashboardStats?.warnedUsers || 0}</Text>
              <Text style={styles.statLabel}>Uyarılı</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Report Stats */}
      {reportStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şikayet İstatistikleri</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScrollView}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Icon name="alert-circle-outline" size={24} color="#ff9800" />
                <Text style={styles.statValue}>{reportStats.pending || 0}</Text>
                <Text style={styles.statLabel}>Bekleyen</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="checkmark-circle-outline" size={24} color="#4caf50" />
                <Text style={styles.statValue}>{reportStats.resolved || 0}</Text>
                <Text style={styles.statLabel}>Çözülen</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="close-circle-outline" size={24} color="#f44336" />
                <Text style={styles.statValue}>{reportStats.rejected || 0}</Text>
                <Text style={styles.statLabel}>Reddedilen</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="flash-outline" size={24} color="#e91e63" />
                <Text style={styles.statValue}>{reportStats.urgentPending || 0}</Text>
                <Text style={styles.statLabel}>Acil</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Reports')}>
          <Icon name="document-text-outline" size={24} color="#0095f6" />
          <Text style={styles.actionButtonText}>Şikayetleri Yönet</Text>
          <Icon name="chevron-forward" size={20} color="#8e8e8e" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('UserManagement')}>
          <Icon name="people-outline" size={24} color="#0095f6" />
          <Text style={styles.actionButtonText}>Kullanıcı Yönetimi</Text>
          <Icon name="chevron-forward" size={20} color="#8e8e8e" />
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AdsManagement')}>
            <Icon name="megaphone-outline" size={24} color="#0095f6" />
            <Text style={styles.actionButtonText}>Reklam Yönetimi</Text>
            <Icon name="chevron-forward" size={20} color="#8e8e8e" />
          </TouchableOpacity>
        )}
      </View>
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
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  statsScrollView: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  statCard: {
    width: 110,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 95,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#8e8e8e',
    marginTop: 4,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
});

