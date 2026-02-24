import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Share } from 'react-native';
import { placeService } from '../services/placeService';
import { locationService } from '../services/locationService';
import { PlaceCard } from '../components/PlaceCard';
import Icon from 'react-native-vector-icons/Ionicons';

export const TourismScreen = () => {
    const [loading, setLoading] = useState(true);
    const [places, setPlaces] = useState([]);
    const [city, setCity] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const detectedCity = await locationService.getCurrentCity();
            setCity(detectedCity);
            const data = await placeService.getPlaces(detectedCity);
            setPlaces(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <PlaceCard item={item} hideOptions={true} />
    );

    return (
        <View style={styles.container}>
            <View style={styles.cityBar}>
                <Icon name="location" size={16} color="#000" />
                <Text style={styles.cityText}>{city || 'Konum Tespit Edilemedi'}</Text>
            </View>
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />
            ) : (
                <FlatList
                    data={places}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Bu şehirde henüz turistik yer eklenmemiş.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    cityBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    cityText: { fontWeight: '600', marginLeft: 6 },
    list: { padding: 12 },
    card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 2 },
    image: { width: '100%', height: 200 },
    content: { padding: 12 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    category: { color: '#007AFF', fontSize: 10, fontWeight: '900' },
    fee: { color: '#34c759', fontSize: 11, fontWeight: '700' },
    name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    description: { color: '#666', marginBottom: 12 },
    actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
    hours: { flexDirection: 'row', alignItems: 'center' },
    hoursText: { color: '#666', fontSize: 12, marginLeft: 4 },
    shareButton: { padding: 4 },
    empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});
