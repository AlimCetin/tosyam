import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Platform,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export interface SelectionOption {
    label: string;
    value: any;
    icon?: string;
    color?: string;
    destructive?: boolean;
}

interface SelectionModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (value: any) => void;
    title: string;
    options: SelectionOption[];
}

export const SelectionModal: React.FC<SelectionModalProps> = ({
    isVisible,
    onClose,
    onSelect,
    title,
    options,
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

                            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                                {options.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.option}
                                        onPress={() => {
                                            onClose();
                                            onSelect(option.value);
                                        }}>
                                        <View style={styles.optionLeft}>
                                            {option.icon && (
                                                <View style={[styles.iconContainer, option.color ? { backgroundColor: option.color + '20' } : null]}>
                                                    <Icon name={option.icon} size={22} color={option.color || '#424242'} />
                                                </View>
                                            )}
                                            <Text style={[
                                                styles.optionText,
                                                option.destructive ? { color: '#FF1744' } : null,
                                                !option.icon ? { marginLeft: 0 } : null
                                            ]}>
                                                {option.label}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

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
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
        maxHeight: '80%',
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
        marginBottom: 20,
        textAlign: 'center',
    },
    optionsList: {
        marginBottom: 16,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        backgroundColor: '#f5f5f5',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#424242',
    },
    cancelButton: {
        marginTop: 8,
        paddingVertical: 16,
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
