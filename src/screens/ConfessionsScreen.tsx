import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { confessionService } from '../services/confessionService';
import { adService } from '../services/adService';
import { AdCard } from '../components/AdCard';
import { CustomActionSheet, ActionSheetOption } from '../components/CustomActionSheet';
import { userService } from '../services/userService';
import { Confession, Post } from '../types';

export const ConfessionsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { showToast } = useToast();
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);
    const [reportingId, setReportingId] = useState<string | null>(null);
    const [reportingUserId, setReportingUserId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeAds, setActiveAds] = useState<Post[]>([]);

    const loadAds = async () => {
        try {
            const response = await adService.getActiveAds();
            const ads = Array.isArray(response) ? response : (response?.ads || []);
            const formattedAds = ads.map((ad: any) => ({
                ...ad,
                type: 'ad',
                adType: ad.type
            }));
            setActiveAds(formattedAds);
        } catch (error) {
            console.error('Reklamlar yüklenemedi:', error);
        }
    };

    const loadConfessions = async (pageNum = 1, isRefreshing = false) => {
        if (loading || (!hasMore && !isRefreshing && pageNum !== 1)) return;

        try {
            if (isRefreshing) {
                setRefreshing(true);
                loadAds();
            }
            else setLoading(true);

            const data = await confessionService.getConfessions(pageNum);

            if (pageNum === 1) {
                setConfessions(data);
            } else {
                setConfessions(prev => [...prev, ...data]);
            }

            setHasMore(data.length === 20);
            setPage(pageNum);
        } catch (error) {
            console.error('İtiraflar yüklenemedi:', error);
            showToast('İtiraflar yüklenirken bir sorun oluştu.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadConfessions(1, true);
        }, [])
    );

    useEffect(() => {
        loadAds();
    }, []);

    const handleLike = async (id: string) => {
        setConfessions(prev =>
            prev.map(c =>
                c.id === id
                    ? {
                        ...c,
                        isLiked: !c.isLiked,
                        likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
                    }
                    : c
            )
        );

        try {
            await confessionService.likeConfession(id);
        } catch (error) {
            console.error('Beğeni hatası:', error);
            loadConfessions(1, false);
        }
    };

    const handleReport = (confession: any) => {
        setReportingId(confession.id);
        setReportingUserId(confession.userId);
        setIsActionSheetVisible(true);
    };

    const handleBlockUser = async () => {
        if (!reportingUserId) {
            showToast('Kullanıcı bilgisi bulunamadı', 'warning');
            return;
        }

        Alert.alert(
            'Kullanıcıyı Engelle',
            'Bu kullanıcıyı engellemek istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Engelle',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.blockUser(reportingUserId);
                            showToast('Kullanıcı engellendi', 'success');
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
                reportedId: reportingId,
                type: 'post'
            })
        }
    ];

    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'ad') {
            return <AdCard ad={item} />;
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.anonymousContainer}>
                        <Icon name="person-circle-outline" size={32} color="#757575" />
                        <Text style={styles.anonymousText}>Anonim</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleReport(item)}>
                        <Icon name="ellipsis-horizontal" size={20} color="#757575" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.text}>{item.text}</Text>

                <View style={styles.cardFooter}>
                    <View style={styles.footerLeft}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleLike(item.id)}
                        >
                            <Icon
                                name={item.isLiked ? "heart" : "heart-outline"}
                                size={24}
                                color={item.isLiked ? "#ed4956" : "#262626"}
                            />
                            <Text style={styles.actionText}>{item.likeCount}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('ConfessionComments', { confessionId: item.id })}
                        >
                            <Icon name="chatbubble-outline" size={22} color="#262626" />
                            <Text style={styles.actionText}>{item.commentCount}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                </View>
            </View>
        );
    };

    const getInterleavedData = () => {
        const combinedData: any[] = [];
        confessions.forEach((confession, index) => {
            combinedData.push(confession);
            if ((index + 1) % 5 === 0 && activeAds.length > 0) {
                const adIndex = Math.floor(index / 5) % activeAds.length;
                combinedData.push(activeAds[adIndex]);
            }
        });
        return combinedData;
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenHeader}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateConfession')}
                >
                    <Text style={styles.createButtonText}>İtiraf Paylaş</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={getInterleavedData()}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.type === 'ad' ? `ad-${item.id}-${index}` : item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadConfessions(1, true)} />
                }
                onEndReached={() => loadConfessions(page + 1)}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Henüz hiç itiraf yok.</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    loading && page !== 1 ? (
                        <ActivityIndicator style={{ padding: 20 }} color="#0095f6" />
                    ) : null
                }
            />
            <CustomActionSheet
                isVisible={isActionSheetVisible}
                onClose={() => setIsActionSheetVisible(false)}
                options={actionSheetOptions}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    screenHeader: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'flex-end',
        backgroundColor: '#fafafa',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    createButtonText: {
        color: '#0095f6',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    anonymousContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    anonymousText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#262626',
    },
    text: {
        fontSize: 15,
        color: '#262626',
        lineHeight: 22,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#efefef',
        paddingTop: 12,
    },
    footerLeft: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#262626',
    },
    date: {
        fontSize: 12,
        color: '#8e8e8e',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#8e8e8e',
    },
});
