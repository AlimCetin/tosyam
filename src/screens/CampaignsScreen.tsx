import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { campaignService } from '../services/campaignService';
import { locationService } from '../services/locationService';
import Icon from 'react-native-vector-icons/Ionicons';
import { CampaignCard } from '../components/CampaignCard';

export const CampaignsScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [city, setCity] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const detectedCity = await locationService.getCurrentCity();
            setCity(detectedCity);
            const data = await campaignService.getCampaigns(detectedCity);
            setCampaigns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimCode = async (campaign: any) => {
        try {
            const result = await campaignService.claimCode(campaign._id);
            Alert.alert('Tebrikler!', `İndirim kodunuz: ${result.code}\nBu kodu işletmede göstererek indiriminizi kullanabilirsiniz.`);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Kod alınamadı.';
            Alert.alert('Hata', msg);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <CampaignCard item={item} onClaim={handleClaimCode} hideOptions={true} />
    );

    return (
        <View style={styles.container}>
            <View style={styles.cityBar}>
                <Icon name="location" size={16} color="#000" />
                <Text style={styles.cityText}>{city || 'Konum Tespit Edilemedi'}</Text>
                <TouchableOpacity onPress={loadData} style={{ marginLeft: 'auto' }}>
                    <Icon name="refresh" size={20} color="#000" />
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />
            ) : (
                <FlatList
                    data={campaigns}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Bu şehirde henüz kampanya yok.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    cityBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    cityText: { fontWeight: '600', marginLeft: 6 },
    list: { padding: 12 },
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 2 },
    image: { width: '100%', height: 180 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, paddingBottom: 0 },
    infoText: { color: '#666', fontSize: 12, fontWeight: '600' },
    paidBadge: { backgroundColor: '#ffd700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    paidText: { fontSize: 9, fontWeight: 'bold' },
    title: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 12, marginTop: 4 },
    description: { color: '#444', paddingHorizontal: 12, marginTop: 4 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', marginTop: 10 },
    discountBadge: { backgroundColor: '#eefcf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#34c759' },
    discountText: { color: '#34c759', fontWeight: 'bold' },
    claimButton: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    claimButtonText: { color: '#fff', fontWeight: '600' },
    empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});
