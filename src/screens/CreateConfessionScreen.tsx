import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../context/ToastContext';
import { confessionService } from '../services/confessionService';

export const CreateConfessionScreen: React.FC = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!text.trim()) {
            showToast('Lütfen bir itiraf yazın.', 'warning');
            return;
        }

        try {
            setLoading(true);
            await confessionService.createConfession(text);
            showToast('İtirafınız başarıyla paylaşıldı.', 'success');
            navigation.goBack();
        } catch (error) {
            console.error('İtiraf oluşturma hatası:', error);
            showToast('İtiraf paylaşılırken bir sorun oluştu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelText}>İptal</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Yeni İtiraf</Text>
                    <TouchableOpacity onPress={handleCreate} disabled={loading || !text.trim()}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#0095f6" />
                        ) : (
                            <Text style={[styles.postText, !text.trim() && styles.disabledText]}>Paylaş</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.infoBox}>
                        <Icon name="information-circle-outline" size={20} color="#0095f6" />
                        <Text style={styles.infoText}>
                            İtiraflar tamamen anonimdir. Kimliğiniz hiçbir şekilde başkalarıyla paylaşılmaz.
                        </Text>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Ne itiraf etmek istersin? (Sadece metin)"
                        placeholderTextColor="#8e8e8e"
                        multiline
                        autoFocus
                        value={text}
                        onChangeText={setText}
                        maxLength={1000}
                    />
                    <Text style={styles.charCount}>{text.length}/1000</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#dbdbdb',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#262626',
    },
    cancelText: {
        fontSize: 16,
        color: '#262626',
    },
    postText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0095f6',
    },
    disabledText: {
        color: '#b2dffc',
    },
    content: {
        padding: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f0f9ff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#0070bb',
        lineHeight: 18,
    },
    input: {
        fontSize: 18,
        color: '#262626',
        textAlignVertical: 'top',
        minHeight: 200,
    },
    charCount: {
        textAlign: 'right',
        color: '#8e8e8e',
        fontSize: 12,
        marginTop: 8,
    },
});
