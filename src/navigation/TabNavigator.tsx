import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { HomeScreen } from '../screens/HomeScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { MenuScreen } from '../screens/MenuScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'grid' : 'grid-outline';
          }

          if (route.name === 'Create') {
            // "Post Oluştur" için ortada daha belirgin ikon isterseniz burayı özelleştirebilirsiniz
            return <Icon name={iconName} size={32} color={color} />;
          }

          return <Icon name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#8e8e8e',
        headerShown: false,
        tabBarShowLabel: false, // Etiketleri gizleyip sadece ikon göstermek daha modern durur
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          backgroundColor: '#fff',
          height: Platform.OS === 'android' ? 60 + insets.bottom : 65,
          paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 10) : 20,
          paddingTop: 10,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Ana Sayfa', headerShown: true }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{
          title: 'Oluştur',
          headerShown: false,
          tabBarStyle: { display: 'none' } // Create screen açıldığında tab bar'ı saklamak iyi UX
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: 'Menü', headerShown: false }}
      />
    </Tab.Navigator>
  );
};
