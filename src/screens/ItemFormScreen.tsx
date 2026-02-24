import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { campaignService } from '../services/campaignService';
import { placeService } from '../services/placeService';
import { locationService } from '../services/locationService';
import Icon from 'react-native-vector-icons/Ionicons';

const ItemFormScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { item, type: rawType } = route.params || {};
    const type = rawType?.endsWith('s') ? rawType.slice(0, -1) : rawType; // Normalize 'campaigns' -> 'campaign'
    const isEdit = !!item;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: item?.title || '',
        description: item?.description || '',
        imageUrl: item?.imageUrl || 'https://picsum.photos/400/200', // Placeholder
        city: item?.city || '',
        businessName: item?.businessName || '',
        // Place specific
        category: item?.category || '',
        address: item?.address || '',
        phone: item?.phone || '',
        // Campaign specific
        discountRate: item?.discountRate || '',
        maxClaims: item?.maxClaims?.toString() || '',
        startDate: item?.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item?.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        hasCode: (item as any)?.hasCode ?? true,
    });

    const [detectingLocation, setDetectingLocation] = useState(false);

    useEffect(() => {
        if (!isEdit) {
            detectLocation();
        }
    }, []);

    const detectLocation = async () => {
        try {
            setDetectingLocation(true);
            const city = await locationService.getCurrentCity();
            if (city) {
                setFormData(prev => ({ ...prev, city }));
            }
        } catch (error) {
            console.error('Location detection error:', error);
        } finally {
            setDetectingLocation(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) {
            Alert.alert('Hata', 'Lütfen başlık ve açıklama alanlarını doldurun.');
            return;
        }

        try {
            setLoading(true);
            const dataToSave = { ...formData };
            if (type === 'campaign') {
                // Sanitize types
                if (dataToSave.maxClaims) {
                    dataToSave.maxClaims = parseInt(dataToSave.maxClaims as string, 10);
                } else {
                    delete (dataToSave as any).maxClaims;
                }
                if (!dataToSave.startDate) delete (dataToSave as any).startDate;
                if (!dataToSave.endDate) delete (dataToSave as any).endDate;

                if (isEdit) {
                    await campaignService.updateCampaign(item._id, dataToSave);
                } else {
                    await campaignService.createCampaign(dataToSave);
                }
            } else {
                if (isEdit) {
                    await placeService.updatePlace(item._id, dataToSave);
                } else {
                    await placeService.createPlace(dataToSave);
                }
            }
            Alert.alert('Başarılı', `${isEdit ? 'Güncellendi' : 'Oluşturuldu'}.`);
            navigation.goBack();
        } catch (error) {
            console.error('Error saving item:', error);
            Alert.alert('Hata', 'Kaydetme işlemi başarısız oldu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.subtitle}>{type === 'campaign' ? 'KAMPANYA / İNDİRİM' : 'YER / İŞLETME'}</Text>
                <Text style={styles.label}>Başlık</Text>
                <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(val) => setFormData({ ...formData, title: val })}
                    placeholder="Örn: Teknosa'da %30 İndirim"
                />

                <Text style={styles.label}>İşletme Adı</Text>
                <TextInput
                    style={styles.input}
                    value={formData.businessName}
                    onChangeText={(val) => setFormData({ ...formData, businessName: val })}
                    placeholder="Örn: Teknosa"
                />

                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Detaylı bilgi yazın..."
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Şehir (Otomatik Alınır)</Text>
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f0f0' }]}>
                    <Text style={{ fontSize: 16, color: '#262626' }}>{formData.city || 'Konum alınıyor...'}</Text>
                    {detectingLocation ? (
                        <ActivityIndicator size="small" color="#3897f0" />
                    ) : (
                        <TouchableOpacity onPress={detectLocation}>
                            <Icon name="refresh" size={20} color="#3897f0" />
                        </TouchableOpacity>
                    )}
                </View>

                {type === 'campaign' && (
                    <>
                        <Text style={styles.label}>İndirim Oranı (%)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.discountRate}
                            onChangeText={(val) => setFormData({ ...formData, discountRate: val })}
                            placeholder="Örn: 30"
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Maksimum Kişi Sayısı (Opsiyonel)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.maxClaims}
                            onChangeText={(val) => setFormData({ ...formData, maxClaims: val })}
                            placeholder="Örn: 100"
                            keyboardType="numeric"
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>Başlangıç (YYYY-AA-GG)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.startDate}
                                    onChangeText={(val) => setFormData({ ...formData, startDate: val })}
                                    placeholder="2024-01-01"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Bitiş (YYYY-AA-GG)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.endDate}
                                    onChangeText={(val) => setFormData({ ...formData, endDate: val })}
                                    placeholder="2024-12-31"
                                />
                            </View>
                        </View>

                        <View style={styles.switchRow}>
                            <Text style={styles.label}>İndirim Kodu Verilsin mi?</Text>
                            <Switch
                                value={formData.hasCode}
                                onValueChange={(val) => setFormData({ ...formData, hasCode: val })}
                            />
                        </View>
                    </>
                )}

                {type === 'place' && (
                    <>
                        <Text style={styles.label}>Kategori</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.category}
                            onChangeText={(val) => setFormData({ ...formData, category: val })}
                            placeholder="Örn: Restoran, Müze"
                        />
                        <Text style={styles.label}>Adres</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.address}
                            onChangeText={(val) => setFormData({ ...formData, address: val })}
                            placeholder="Açık adres..."
                        />
                    </>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderBottomColor: '#dbdbdb',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#262626',
    },
    subtitle: {
        fontSize: 12,
        color: '#3897f0',
        fontWeight: 'bold',
        marginBottom: 15,
        letterSpacing: 1,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#262626',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#fafafa',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#3897f0',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ItemFormScreen;
