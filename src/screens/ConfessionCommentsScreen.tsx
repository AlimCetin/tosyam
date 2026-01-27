import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    SafeAreaView,
    Keyboard,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { confessionService } from '../services/confessionService';
import { authService } from '../services/authService';
import { Confession, ConfessionComment } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const ConfessionCommentsScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { showToast } = useToast();
    const { confessionId } = route.params;

    const [comments, setComments] = useState<ConfessionComment[]>([]);
    const [confession, setConfession] = useState<Confession | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [sending, setSending] = useState(false);
    const [isOwnConfession, setIsOwnConfession] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const headerHeight = useHeaderHeight();
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [confessionData, commentsData] = await Promise.all([
                confessionService.getConfessionById(confessionId),
                confessionService.getComments(confessionId)
            ]);

            setConfession(confessionData);
            setComments(commentsData);

            // Ownership check
            const currentUser = authService.getCurrentUser() as any;
            const currentUserId = currentUser?._id || currentUser?.id;
            const authorId = (confessionData as any).userId;

            setIsOwnConfession(Boolean(currentUserId && authorId && currentUserId === authorId));
        } catch (error) {
            console.error('Veriler yüklenemedi:', error);
            showToast('Bilgiler yüklenemedi', 'error');
        } finally {
            setLoading(false);
        }
    }, [confessionId]);

    useEffect(() => {
        loadData();

        const showSub = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
            (e) => {
                if (Platform.OS === 'android') {
                    setKeyboardHeight(e.endCoordinates.height);
                }
            }
        );

        const hideSub = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
            () => {
                if (Platform.OS === 'android') {
                    setKeyboardHeight(0);
                }
            }
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [loadData]);

    const handleSendComment = async () => {
        if (!commentText.trim() || sending) return;

        try {
            setSending(true);
            await confessionService.addComment(confessionId, commentText);
            setCommentText('');
            // Sadece yorumları yenile
            const commentsData = await confessionService.getComments(confessionId);
            setComments(commentsData);
            showToast('Yorumunuz başarıyla eklendi.', 'success');
        } catch (error) {
            showToast('Yorum gönderilemedi.', 'error');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteConfession = async () => {
        try {
            setLoading(true);
            await confessionService.deleteConfession(confessionId);
            showToast('İtiraf başarıyla silindi', 'success');
            navigation.goBack();
        } catch (error) {
            showToast('İtiraf silinemedi', 'error');
        } finally {
            setLoading(false);
            setDeleteModalVisible(false);
        }
    };

    const renderItem = ({ item }: { item: ConfessionComment }) => (
        <View style={styles.commentItem}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.userInitials}</Text>
            </View>
            <View style={styles.commentContent}>
                <Text style={styles.initials}>{item.userInitials}</Text>
                <Text style={styles.text}>{item.text}</Text>
                <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')} {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
                style={styles.container}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#0095f6" />
                    </View>
                ) : (
                    <FlatList
                        data={comments}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        style={{ flex: 1 }}
                        ListHeaderComponent={
                            confession && (
                                <View style={styles.headerCard}>
                                    <View style={styles.headerInfo}>
                                        <Text style={styles.headerTitle}>İtiraf</Text>
                                        <Text style={styles.headerDate}>
                                            {new Date(confession.createdAt).toLocaleDateString('tr-TR')}
                                        </Text>
                                    </View>
                                    <Text style={styles.confessionText}>{confession.text}</Text>

                                    <View style={styles.headerActions}>
                                        <View style={styles.stats}>
                                            <Icon name="heart" size={16} color="#ed4956" />
                                            <Text style={styles.statText}>{confession.likeCount}</Text>
                                            <Icon name="chatbubble" size={16} color="#8e8e8e" style={{ marginLeft: 12 }} />
                                            <Text style={styles.statText}>{confession.commentCount}</Text>
                                        </View>

                                        {isOwnConfession && (
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => setDeleteModalVisible(true)}
                                            >
                                                <Icon name="trash-outline" size={20} color="#ed4956" />
                                                <Text style={styles.deleteText}>Sil</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Henüz yorum yapılmamış.</Text>
                            </View>
                        }
                    />
                )}

                <View style={[styles.inputContainer, Platform.OS === 'android' && { marginBottom: keyboardHeight }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Yorum yaz..."
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSendComment}
                        disabled={!commentText.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#0095f6" />
                        ) : (
                            <Text style={[styles.sendText, !commentText.trim() && styles.disabledSend]}>
                                Paylaş
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <ConfirmationModal
                isVisible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleDeleteConfession}
                title="İtirafı Sil"
                message="Bu itirafı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
                confirmText="Sil"
                isDestructive={true}
                icon="trash-outline"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#dbdbdb',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#757575',
    },
    commentContent: {
        flex: 1,
    },
    initials: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#262626',
        marginBottom: 2,
    },
    text: {
        fontSize: 14,
        color: '#262626',
        lineHeight: 18,
    },
    date: {
        fontSize: 11,
        color: '#8e8e8e',
        marginTop: 4,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#dbdbdb',
        backgroundColor: '#fff',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
    },
    sendText: {
        fontWeight: 'bold',
        color: '#0095f6',
    },
    disabledSend: {
        color: '#b2dffc',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#8e8e8e',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#efefef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#8e8e8e',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerDate: {
        fontSize: 12,
        color: '#8e8e8e',
    },
    confessionText: {
        fontSize: 16,
        color: '#262626',
        lineHeight: 24,
        marginBottom: 16,
    },
    headerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 14,
        color: '#262626',
        fontWeight: '600',
        marginLeft: 6,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    deleteText: {
        color: '#ed4956',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
});
