import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface MediaPickerModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectCamera: () => void;
    onSelectGallery: () => void;
    title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
    isVisible,
    onClose,
    onSelectCamera,
    onSelectGallery,
    title = 'Seçenekler',
}) => {
    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <View style={styles.handle} />
                            <Text style={styles.title}>{title}</Text>

                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onClose();
                                        onSelectCamera();
                                    }}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                                        <Icon name="camera" size={28} color="#2196F3" />
                                    </View>
                                    <Text style={styles.optionText}>Kameradan Çek</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onClose();
                                        onSelectGallery();
                                    }}>
                                    <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                                        <Icon name="images" size={28} color="#9C27B0" />
                                    </View>
                                    <Text style={styles.optionText}>Galeriden Seç</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelText}>İptal</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        paddingTop: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 24,
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    option: {
        alignItems: 'center',
        width: 120,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#424242',
    },
    cancelButton: {
        marginTop: 8,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
    },
});
