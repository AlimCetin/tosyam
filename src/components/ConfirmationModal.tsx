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

interface ConfirmationModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    icon?: string;
    iconColor?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Tamam',
    cancelText = 'İptal',
    isDestructive = false,
    icon = 'help-circle-outline',
    iconColor = '#607D8B',
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
                            <View style={styles.iconContainer}>
                                <View style={[styles.iconCircle, { backgroundColor: (isDestructive ? '#FFEBEE' : iconColor + '15') }]}>
                                    <Icon name={icon} size={32} color={isDestructive ? '#FF1744' : iconColor} />
                                </View>
                            </View>

                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelText}>{cancelText}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.confirmButton, isDestructive ? styles.destructiveButton : null]}
                                    onPress={() => {
                                        onClose();
                                        onConfirm();
                                    }}>
                                    <Text style={styles.confirmText}>{confirmText}</Text>
                                </TouchableOpacity>
                            </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    iconContainer: {
        marginBottom: 16,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#757575',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#0095f6',
    },
    destructiveButton: {
        backgroundColor: '#FF1744',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
