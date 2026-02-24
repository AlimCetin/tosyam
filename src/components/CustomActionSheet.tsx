import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Platform,
    SafeAreaView,
} from 'react-native';

export interface ActionSheetOption {
    label: string;
    onPress: () => void;
    destructive?: boolean;
    color?: string;
}

interface CustomActionSheetProps {
    isVisible: boolean;
    onClose: () => void;
    options: ActionSheetOption[];
}

export const CustomActionSheet: React.FC<CustomActionSheetProps> = ({
    isVisible,
    onClose,
    options,
}) => {
    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <SafeAreaView style={styles.container}>
                            <View style={styles.content}>
                                <View style={styles.optionsBlock}>
                                    {options.map((option, index) => (
                                        <React.Fragment key={index}>
                                            <TouchableOpacity
                                                style={styles.option}
                                                onPress={() => {
                                                    onClose();
                                                    option.onPress();
                                                }}>
                                                <Text style={[
                                                    styles.optionText,
                                                    option.destructive ? styles.destructiveText : null,
                                                    option.color ? { color: option.color } : null
                                                ]}>
                                                    {option.label}
                                                </Text>
                                            </TouchableOpacity>
                                            {index < options.length - 1 && <View style={styles.separator} />}
                                        </React.Fragment>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.cancelBlock} onPress={onClose}>
                                    <Text style={styles.cancelText}>İptal</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
    },
    content: {
        paddingHorizontal: 10,
        paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    },
    optionsBlock: {
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 8,
        overflow: 'hidden',
    },
    option: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 18,
        color: '#262626',
        fontWeight: '500',
    },
    destructiveText: {
        color: '#ed4956',
        fontWeight: '600',
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#dbdbdb',
        width: '100%',
    },
    cancelBlock: {
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 18,
        color: '#0095f6',
        fontWeight: '600',
    },
});
