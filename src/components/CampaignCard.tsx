import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { authService } from '../services/authService';
import { campaignService } from '../services/campaignService';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';
import { CustomActionSheet, ActionSheetOption } from './CustomActionSheet';

export const CampaignCard = ({ item, onClaim, hideOptions = false }: { item: any, onClaim: (item: any) => void, hideOptions?: boolean }) => {
    const navigation = useNavigation<any>();
    const { showToast } = useToast();
    const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
    const [isLiked, setIsLiked] = useState(item.isLiked || false);
    const [likeCount, setLikeCount] = useState(item.likeCount || 0);

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
            await api.post(`/campaigns/${item.id || item._id}/like`);
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
                type: 'campaign'
            })
        }
    ];

    if (canManage && !hideOptions) {
        actionSheetOptions.splice(1, 0,
            { label: 'Düzenle', onPress: () => navigation.navigate('ItemForm', { item, type: 'campaign' }) },
            {
                label: 'Sil',
                destructive: true,
                onPress: () => {
                    Alert.alert('Sil', 'Bu kampanyayı silmek istediğinize emin misiniz?', [
                        { text: 'Hayır', style: 'cancel' },
                        {
                            text: 'Evet, Sil',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await campaignService.deleteCampaign(item.id || item._id);
                                    Alert.alert('Başarılı', 'Kampanya silindi.');
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
                    <Icon name="megaphone" size={16} color="#424242" />
                    <Text style={styles.businessName}>{item.businessName} • KAMPANYA</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setIsActionSheetVisible(true)}
                    style={styles.optionsButton}
                >
                    <Icon name="ellipsis-horizontal" size={20} color="#8e8e8e" />
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={[styles.discountBadge, styles.discountBadgeAbsolute]}>
                    <Text style={styles.discountText}>%{item.discountRate} İNDİRİM</Text>
                </View>
            </View>

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
                        itemType: 'campaigns',
                    })}>
                        <Icon name="chatbubbles-outline" size={27} color="#424242" />
                    </TouchableOpacity>
                </View>
                {(item.hasCode ?? true) && (
                    <TouchableOpacity
                        style={[
                            styles.claimButton,
                            item.maxClaims && item.currentClaims >= item.maxClaims ? styles.disabledButton : {}
                        ]}
                        onPress={() => onClaim(item)}
                        disabled={item.maxClaims && item.currentClaims >= item.maxClaims}
                    >
                        <Text style={styles.claimButtonText}>
                            {item.maxClaims && item.currentClaims >= item.maxClaims ? 'Tükendi' : 'Kodu Al'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.footer}>
                {likeCount > 0 && (
                    <Text style={styles.likes}>{likeCount} beğeni</Text>
                )}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                <TouchableOpacity onPress={() => navigation.navigate('ItemComments', {
                    itemId: item.id || item._id,
                    itemType: 'campaigns',
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
    businessName: {
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 13,
    },
    optionsButton: {
        padding: 4,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f0f0f0',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    discountBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#FF3B30',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 6,
    },
    discountBadgeAbsolute: {
        position: 'absolute',
        top: 12,
        right: 12,
        marginBottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    discountText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 12,
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
        marginBottom: 4,
    },
    commentsLink: {
        color: '#8e8e8e',
        marginTop: 4,
        fontSize: 14,
    },
    claimButton: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    disabledButton: {
        backgroundColor: '#8e8e8e',
    },
    claimButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
