import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import api from '../services/api';

interface Comment {
    _id: string;
    text: string;
    createdAt: string;
    user?: {
        _id: string;
        fullName: string;
        profileImage?: string;
    };
}

interface ItemCommentModalProps {
    visible: boolean;
    onClose: () => void;
    itemId: string;
    itemType: 'place' | 'campaign'; // Endpoint prefix
    title: string;
}

export const ItemCommentModal: React.FC<ItemCommentModalProps> = ({
    visible,
    onClose,
    itemId,
    itemType,
    title,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    const endpoint = itemType === 'place' ? 'places' : 'campaigns';

    useEffect(() => {
        if (visible && itemId) {
            loadComments();
        }
    }, [visible, itemId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/${endpoint}/${itemId}/comments`);
            setComments(data);
        } catch (e) {
            console.error('Yorumlar yüklenemedi:', e);
        } finally {
            setLoading(false);
        }
    };

    const postComment = async () => {
        if (!text.trim()) return;
        setPosting(true);
        try {
            const { data } = await api.post(`/${endpoint}/${itemId}/comments`, { text: text.trim() });
            setComments(prev => [data, ...prev]);
            setText('');
        } catch (e) {
            console.error('Yorum gönderilemedi:', e);
        } finally {
            setPosting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentRow}>
            {item.user?.profileImage ? (
                <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                </View>
            )}
            <View style={styles.commentBody}>
                <Text style={styles.userName}>{item.user?.fullName || 'Kullanıcı'}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
                <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{title} - Yorumlar</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeBtn}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 32 }} color="#0095f6" />
                    ) : (
                        <FlatList
                            data={comments}
                            keyExtractor={item => item._id}
                            renderItem={renderComment}
                            ListEmptyComponent={
                                <Text style={styles.empty}>Henüz yorum yok. İlk yorumu sen yap!</Text>
                            }
                            contentContainerStyle={{ padding: 16 }}
                        />
                    )}

                    {/* Input */}
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Yorum yaz..."
                            value={text}
                            onChangeText={setText}
                            multiline
                            maxLength={300}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, posting && { opacity: 0.6 }]}
                            onPress={postComment}
                            disabled={posting || !text.trim()}
                        >
                            {posting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.sendText}>Gönder</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        minHeight: '50%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#222',
        flex: 1,
    },
    closeBtn: {
        fontSize: 18,
        color: '#666',
        paddingLeft: 12,
    },
    commentRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#0095f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    commentBody: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 10,
    },
    userName: {
        fontWeight: '700',
        fontSize: 13,
        color: '#222',
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    commentDate: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    empty: {
        textAlign: 'center',
        color: '#999',
        marginTop: 40,
        fontSize: 14,
    },
    inputRow: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        maxHeight: 80,
        marginRight: 8,
    },
    sendBtn: {
        backgroundColor: '#0095f6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    sendText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});
