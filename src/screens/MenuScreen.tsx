import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export const MenuScreen = () => {
    const navigation = useNavigation<any>();

    const menuItems = [
        {
            id: 'campaigns',
            title: 'İndirimler',
            icon: 'pricetag-outline',
            color: '#FF9800',
            screen: 'Campaigns',
        },
        {
            id: 'tourism',
            title: 'Keşfet',
            icon: 'map-outline',
            color: '#4CAF50',
            screen: 'Tourism',
        },
        {
            id: 'confessions',
            title: 'İtiraflar',
            icon: 'chatbubbles-outline',
            color: '#9C27B0',
            screen: 'Confessions',
        },
        {
            id: 'my-items',
            title: 'Paylaşımlarım',
            icon: 'folder-open-outline',
            color: '#E91E63',
            screen: 'MyItems',
        },
        {
            id: 'profile',
            title: 'Profilim',
            icon: 'person-outline',
            color: '#2196F3',
            screen: 'Profile',
            params: { userId: 'me' } // Or however your profile screen handles 'me'
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Menü</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => navigation.navigate(item.screen, item.params)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '1A' }]}>
                                <Icon name={item.icon} size={32} color={item.color} />
                            </View>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.listContainer}>
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Icon name="settings-outline" size={24} color="#000" />
                        <Text style={styles.listItemText}>Ayarlar</Text>
                        <Icon name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => navigation.navigate('SavedPosts')}
                    >
                        <Icon name="bookmark-outline" size={24} color="#000" />
                        <Text style={styles.listItemText}>Kaydedilenler</Text>
                        <Icon name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    menuItem: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    listContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listItemText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 16,
        color: '#000',
    },
});
