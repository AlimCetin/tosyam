import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { authService } from '../services/authService';
import { placeService } from '../services/placeService';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { CustomActionSheet, ActionSheetOption } from './CustomActionSheet';

export const PlaceCard = ({ item, hideOptions = false }: { item: any, hideOptions?: boolean }) => {
    const navigation = useNavigation<any>();
    const { showToast } = useToast();
    const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
    const [isLiked, setIsLiked] = useState(item.isLiked || false);
    const [likeCount, setLikeCount] = useState(item.likeCount || 0);

    const handleMapPress = () => {
        const query = encodeURIComponent(`${item.name} ${item.city}`);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        Linking.openURL(url).catch(err => console.error('Harita açılamadı:', err));
    };

    const currentUser: any = authService.getCurrentUser();
    const canManage = currentUser?.id === item.createdBy ||
        currentUser?.role === 'admin' ||
        currentUser?.role === 'moderator' ||
        currentUser?.role === 'super_admin';

    const handleLike = async () => {
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikeCount((c: number) => newLiked ? c + 1 : c - 1);
        try {
            await api.post(`/places/${item.id || item._id}/like`);
        } catch (e) {
            setIsLiked(!newLiked);
            setLikeCount((c: number) => newLiked ? c - 1 : c + 1);
        }
    };

    const handleBlockUser = async () => {
        Alert.alert(
            'Kullanıcıyı Engelle',
            'Bu işletme sahibini engellemek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Engelle',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const ownerId = item.userId;
                            if (ownerId) {
                                await userService.blockUser(ownerId);
                                showToast('İşletme sahibi engellendi', 'success');
                            } else {
                                showToast('İşletme sahibi bilgisi bulunamadı', 'warning');
                            }
                        } catch (error: any) {
                            showToast(error.response?.data?.message || 'Engelleme başarısız oldu', 'error');
                        }
                    }
                }
            ]
        );
    };

    const actionSheetOptions: ActionSheetOption[] = [
        {
            label: 'Kullanıcıyı Engelle',
            onPress: handleBlockUser
        },
        {
            label: 'Şikayet Et',
            destructive: true,
            onPress: () => navigation.navigate('ReportUser', {
                reportedId: item.id || item._id,
                type: 'place'
            })
        }
    ];

    if (canManage && !hideOptions) {
        actionSheetOptions.splice(1, 0,
            { label: 'Düzenle', onPress: () => navigation.navigate('ItemForm', { item, type: 'place' }) },
            {
                label: 'Sil',
                destructive: true,
                onPress: () => {
                    Alert.alert('Sil', 'Bu yeri silmek istediğinize emin misiniz?', [
                        { text: 'Hayır', style: 'cancel' },
                        {
                            text: 'Evet, Sil',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await placeService.deletePlace(item.id || item._id);
                                    Alert.alert('Başarılı', 'Yer silindi.');
                                } catch (e) {
                                    Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
                                }
                            }
                        }
                    ]);
                }
            }
        );
    }

    return (
        <View style={styles.container}>
            <CustomActionSheet
                isVisible={isActionSheetVisible}
                onClose={() => setIsActionSheetVisible(false)}
                options={actionSheetOptions}
            />
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon name="location" size={16} color="#0095f6" />
                    <Text style={styles.categoryName}>
                        {(item.category || 'TURİZM').toUpperCase()}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => setIsActionSheetVisible(true)}
                    style={styles.optionsButton}
                >
                    <Icon name="ellipsis-horizontal" size={20} color="#8e8e8e" />
                </TouchableOpacity>
            </View>

            {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : null}

            <View style={styles.actions}>
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={handleLike} activeOpacity={0.7}>
                        <Icon
                            name={isLiked ? 'heart' : 'heart-outline'}
                            size={28}
                            color={isLiked ? '#FF1744' : '#424242'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ItemComments', {
                        itemId: item.id || item._id,
                        itemType: 'places',
                    })}>
                        <Icon name="chatbubbles-outline" size={27} color="#424242" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleMapPress}>
                        <Icon name="navigate-outline" size={27} color="#424242" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                {likeCount > 0 && (
                    <Text style={styles.likes}>{likeCount} beğeni</Text>
                )}
                <Text style={styles.title}>{item.name}</Text>
                {item.description ? (
                    <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
                ) : null}

                {item.workingHours ? (
                    <View style={styles.infoRow}>
                        <Icon name="time-outline" size={13} color="#999" />
                        <Text style={styles.infoText}>{item.workingHours}</Text>
                    </View>
                ) : null}

                {item.address ? (
                    <View style={styles.infoRow}>
                        <Icon name="map-outline" size={13} color="#999" />
                        <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
                    </View>
                ) : null}

                <View style={styles.infoRow}>
                    <Icon name="pricetag-outline" size={13} color="#999" />
                    <Text style={styles.infoText}>{item.entryFee || 'Ücretsiz'}</Text>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ItemComments', {
                    itemId: item.id || item._id,
                    itemType: 'places',
                })}>
                    {(item.commentCount || 0) > 0 ? (
                        <Text style={styles.commentsLink}>{item.commentCount} yorumun tamamını gör</Text>
                    ) : (
                        <Text style={styles.commentsLink}>Yorum yap...</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryName: {
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 13,
        color: '#0095f6',
    },
    optionsButton: {
        padding: 4,
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f0f0f0',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 16,
    },
    footer: {
        paddingHorizontal: 12,
        paddingBottom: 12,
    },
    likes: {
        fontWeight: '600',
        marginBottom: 6,
        fontSize: 14,
        color: '#262626',
    },
    title: {
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 4,
        color: '#262626',
    },
    description: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: '#8e8e8e',
        marginLeft: 5,
        flex: 1,
    },
    commentsLink: {
        color: '#8e8e8e',
        marginTop: 4,
        fontSize: 14,
    },
});
