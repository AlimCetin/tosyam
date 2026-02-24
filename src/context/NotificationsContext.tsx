import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../constants/config';
import { Storage } from '../utils/storage';
import { useToast } from './ToastContext';
import { DeviceEventEmitter } from 'react-native';
import { authService } from '../services/authService';

interface NotificationsContextType {
    socket: any;
}

const NotificationsContext = createContext<NotificationsContextType>({ socket: null });

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<any>(null);
    const { showToast } = useToast();

    useEffect(() => {
        let newSocket: any = null;

        const connectSocket = () => {
            if (newSocket) {
                newSocket.disconnect();
            }

            const token = Storage.getString('token');
            if (!token) {
                console.log('🔌 WebSocket: Token bulunamadı, bağlantı kurulmuyor.');
                return;
            }

            console.log('🔄 WebSocket: Bağlantı kuruluyor...');
            newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket'], // Faster and avoids some CORS issues
                reconnection: true,
                reconnectionAttempts: 5,
            });

            newSocket.on('connect', () => {
                console.log('🌐 Global Notifications Socket Connected | ID:', newSocket.id);
                setSocket(newSocket);
            });

            newSocket.on('connect_error', async (err: any) => {
                console.error('❌ WebSocket Bağlantı Hatası:', err.message);
                if (err.message === 'jwt expired') {
                    console.log('🔑 WebSocket: JWT süresi dolmuş, manuel olarak token yenileme tetikleniyor...');
                    // REST API üzerinden token yenilemeyi tetikle
                    const refreshed = await authService.refreshToken();
                    if (refreshed) {
                        const newToken = Storage.getString('token');
                        // api.ts'deki logic de bunu fırlatıyor ama biz burada manuel de fırlatalım 
                        // ya da sadece connectSocket() çağırabiliriz. 
                        // api.ts fırlatırsa connectSocket() otomatik çağrılacak.
                        // authService.refreshToken() başarılı dönerse api.ts DeviceEventEmitter yakalayacak mı?
                        // Hayır, api.ts içindeki DeviceEventEmitter.emit(token-refreshed) sadece interceptor içinde.
                        // authService.refreshToken() kendi başına emit yapmıyor.
                        if (newToken) {
                            DeviceEventEmitter.emit('token-refreshed', { token: newToken });
                        }
                    }
                }
            });

            newSocket.on('unreadCounts', (data: any) => {
                console.log('📊 WebSocket ile gelen Okunmamış Sayıları:', data);
            });

            newSocket.on('newNotification', (data: any) => {
                console.log('🔔 WebSocket ile Yeni Bildirim Geldi:', data);

                let message = 'Yeni bir bildiriminiz var';
                if (data.type === 'like') {
                    message = `${data.data.fromUser?.fullName || 'Biri'} gönderinizi beğendi.`;
                } else if (data.type === 'comment') {
                    message = `${data.data.fromUser?.fullName || 'Biri'} gönderinize yorum yaptı.`;
                } else if (data.type === 'message') {
                    message = `${data.data.sender?.fullName || 'Biri'} size mesaj gönderdi.`;
                }

                showToast(message, 'info');
            });

            newSocket.on('disconnect', (reason: string) => {
                console.log('❌ Global Notifications Socket Disconnected | Sebep:', reason);
                setSocket(null);
            });
        };

        connectSocket();

        // Token yenilendiğinde socket'i de yenile
        const tokenListener = DeviceEventEmitter.addListener('token-refreshed', () => {
            console.log('🔑 WebSocket: Token yenilendi, socket bağlantısı tazeleniyor...');
            connectSocket();
        });

        return () => {
            if (newSocket) {
                console.log('🔌 WebSocket: Kapatılıyor...');
                newSocket.disconnect();
            }
            tokenListener.remove();
        };
    }, []);

    return (
        <NotificationsContext.Provider value={{ socket }}>
            {children}
        </NotificationsContext.Provider>
    );
};
