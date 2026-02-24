import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { campaignService } from '../services/campaignService';
import { placeService } from '../services/placeService';
import { PlaceCard } from '../components/PlaceCard';
import { CampaignCard } from '../components/CampaignCard';

const MyItemsScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'campaigns' | 'places'>('campaigns');
    const [items, setItems] = useState<any[]>([]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            if (activeTab === 'campaigns') {
                const data = await campaignService.getMyCampaigns();
                setItems(data.map((item: any) => ({ ...item, type: 'campaign' })));
            } else {
                const data = await placeService.getMyPlaces();
                setItems(data.map((item: any) => ({ ...item, type: 'place' })));
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            Alert.alert('Hata', 'Paylaşımlarınız yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const handleDelete = (id: string) => {
        Alert.alert(
            'Sil',
            'Bu kaydı silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (activeTab === 'campaigns') {
                                await campaignService.deleteCampaign(id);
                            } else {
                                await placeService.deletePlace(id);
                            }
                            setItems(prev => prev.filter(item => item._id !== id));
                            Alert.alert('Başarılı', 'Kayıt silindi.');
                        } catch (error) {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (item: any) => {
        const type = activeTab === 'campaigns' ? 'campaign' : 'place';
        navigation.navigate('ItemForm', { item, type });
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cardContainer}>
            {activeTab === 'places' ? (
                <PlaceCard item={item} />
            ) : (
                <CampaignCard item={item} onClaim={() => { }} />
            )}
            <View style={styles.actionOverlay}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
                    <Icon name="create-outline" size={24} color="#3897f0" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item._id)}>
                    <Icon name="trash-outline" size={24} color="#ed4956" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'campaigns' && styles.activeTab]}
                    onPress={() => setActiveTab('campaigns')}
                >
                    <Text style={[styles.tabText, activeTab === 'campaigns' && styles.activeTabText]}>İndirimlerim</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'places' && styles.activeTab]}
                    onPress={() => setActiveTab('places')}
                >
                    <Text style={[styles.tabText, activeTab === 'places' && styles.activeTabText]}>Yerlerim</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3897f0" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="document-text-outline" size={64} color="#dbdbdb" />
                            <Text style={styles.emptyText}>Henüz bir paylaşımınız yok.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ItemForm', { type: activeTab === 'campaigns' ? 'campaign' : 'place' })}
            >
                <Icon name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#dbdbdb',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3897f0',
    },
    tabText: {
        fontSize: 14,
        color: '#8e8e8e',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#3897f0',
    },
    cardContainer: {
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    actionOverlay: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 15,
        paddingBottom: 15,
        marginTop: -10, // Adjust based on Card styling
    },
    actionButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginLeft: 10,
    },
    deleteButton: {
        backgroundColor: '#fff1f0',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 10,
        color: '#8e8e8e',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        backgroundColor: '#3897f0',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default MyItemsScreen;
