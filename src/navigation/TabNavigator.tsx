import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { ConfessionsScreen } from '../screens/ConfessionsScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Confessions') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#8e8e8e',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#dbdbdb',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#dbdbdb',
          height: Platform.OS === 'android' ? 50 + insets.bottom : 50,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 5) : 5,
          paddingTop: 5,
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Tab.Screen
        name="Confessions"
        component={ConfessionsScreen}
        options={{ title: 'İtiraflar' }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ title: 'Oluştur' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profil',
        }}

      />
    </Tab.Navigator>
  );
};
