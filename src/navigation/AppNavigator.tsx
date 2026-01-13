import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { BlockUserScreen } from '../screens/BlockUserScreen';
import { BlockedUsersScreen } from '../screens/BlockedUsersScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';
import { SecuritySettingsScreen } from '../screens/SecuritySettingsScreen';
import { ManageHiddenUsersScreen } from '../screens/ManageHiddenUsersScreen';
import { SelectHiddenFollowersScreen } from '../screens/SelectHiddenFollowersScreen';
import { ReportUserScreen } from '../screens/ReportUserScreen';
import { CommentsScreen } from '../screens/CommentsScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { ProfileMenuScreen } from '../screens/ProfileMenuScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LikesListScreen } from '../screens/LikesListScreen';
import { FollowListScreen } from '../screens/FollowListScreen';
import { SavedPostsScreen } from '../screens/SavedPostsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AccountSettingsScreen } from '../screens/AccountSettingsScreen';
import { AccountsScreen } from '../screens/AccountsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AdminPanelScreen } from '../screens/AdminPanelScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { UserManagementScreen } from '../screens/UserManagementScreen';
import { AdsManagementScreen } from '../screens/AdsManagementScreen';
import { navigationRef } from './navigationRef';

const Stack = createStackNavigator();

interface AppNavigatorProps {
  initialRouteName?: string;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({ initialRouteName = 'MainTabs' }) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#dbdbdb',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ 
            headerShown: true,
            title: 'Giriş Yap',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Ara' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: 'Bildirimler' }}
        />
        <Stack.Screen
          name="Messages"
          component={MessagesScreen}
          options={{ title: 'Mesajlar' }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({ title: 'Sohbet' })}
        />
        <Stack.Screen
          name="Comments"
          component={CommentsScreen}
          options={{ title: 'Yorumlar' }}
        />
        <Stack.Screen
          name="LikesList"
          component={LikesListScreen}
          options={{ title: 'Beğenenler' }}
        />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          options={{ title: 'Gönderi' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => ({
            title: 'Profil',
            headerBackTitleVisible: false,
          })}
        />
        <Stack.Screen
          name="FollowList"
          component={FollowListScreen}
          options={({ route }: any) => ({ 
            title: (route.params as any)?.type === 'followers' ? 'Takipçiler' : 'Takip Edilenler' 
          })}
        />
        <Stack.Screen
          name="SavedPosts"
          component={SavedPostsScreen}
          options={{ title: 'Kaydedilenler' }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: 'Profili Düzenle' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Ayarlar' }}
        />
        <Stack.Screen
          name="BlockUser"
          component={BlockUserScreen}
          options={{ title: 'Kullanıcıyı Engelle' }}
        />
        <Stack.Screen
          name="BlockedUsers"
          component={BlockedUsersScreen}
          options={{ title: 'Engellenen Kullanıcılar' }}
        />
        <Stack.Screen
          name="PrivacySettings"
          component={PrivacySettingsScreen}
          options={{ title: 'Gizlilik' }}
        />
        <Stack.Screen
          name="SecuritySettings"
          component={SecuritySettingsScreen}
          options={{ title: 'Güvenlik' }}
        />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
          options={{ title: 'Hesap Ayarları' }}
        />
        <Stack.Screen
          name="Accounts"
          component={AccountsScreen}
          options={{ title: 'Hesaplar' }}
        />
        <Stack.Screen
          name="ManageHiddenUsers"
          component={ManageHiddenUsersScreen}
          options={({ route }: any) => ({ 
            title: (route.params as any)?.type === 'followers' 
              ? 'Gizli Takipçiler' 
              : 'Gizli Takip Edilenler' 
          })}
        />
        <Stack.Screen
          name="SelectHiddenFollowers"
          component={SelectHiddenFollowersScreen}
          options={{ title: 'Takipçilerden Gizle' }}
        />
        <Stack.Screen
          name="ReportUser"
          component={ReportUserScreen}
          options={{ title: 'Şikayet Et' }}
        />
        <Stack.Screen
          name="ProfileMenu"
          component={ProfileMenuScreen}
          options={{ 
            presentation: 'transparentModal',
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' }
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ 
            headerShown: true,
            title: 'Kayıt Ol',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="AdminPanel"
          component={AdminPanelScreen}
          options={{ title: 'Admin Paneli' }}
        />
        <Stack.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ title: 'Şikayetler' }}
        />
        <Stack.Screen
          name="UserManagement"
          component={UserManagementScreen}
          options={{ title: 'Kullanıcı Yönetimi' }}
        />
        <Stack.Screen
          name="AdsManagement"
          component={AdsManagementScreen}
          options={{ title: 'Reklam Yönetimi' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
