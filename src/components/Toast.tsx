import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    visible: boolean;
    message: string;
    type: ToastType;
    onHide: () => void;
}

const { width } = Dimensions.get('window');

const TOAST_COLORS = {
    success: '#10b981', // Emerald 500
    error: '#f43f5e',   // Rose 500
    info: '#3b82f6',    // Blue 500
    warning: '#f59e0b', // Amber 500
};

const TOAST_ICONS = {
    success: 'checkmark-circle',
    error: 'close-circle',
    info: 'information-circle',
    warning: 'alert-circle',
};

export const Toast: React.FC<ToastProps> = ({ visible, message, type, onHide }) => {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: insets.top + 10,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 10,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, insets.top, translateY, opacity]);

    // Don't render if not visible and opacity is 0 (approx)
    if (!visible && (opacity as any).__getValue() <= 0) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.85)' : '#ffffff',
                },
            ]}
        >
            <View style={[styles.indicator, { backgroundColor: TOAST_COLORS[type] }]} />
            <Icon name={TOAST_ICONS[type] as any} size={24} color={TOAST_COLORS[type]} />
            <Text style={styles.message} numberOfLines={2}>
                {message}
            </Text>
            <TouchableOpacity onPress={onHide} style={styles.closeButton}>
                <Icon name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        zIndex: 9999,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            },
        }),
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    indicator: {
        width: 4,
        height: '60%',
        borderRadius: 2,
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        marginLeft: 10,
        lineHeight: 20,
    },
    closeButton: {
        padding: 4,
        marginLeft: 10,
    },
});
