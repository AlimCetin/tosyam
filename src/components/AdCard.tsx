import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { Post } from '../types';
import { adService } from '../services/adService';

interface AdCardProps {
  ad: Post;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const handleAdClick = async () => {
    try {
      await adService.recordClick(ad.id);
      if (ad.linkUrl) {
        const supported = await Linking.canOpenURL(ad.linkUrl);
        if (supported) {
          await Linking.openURL(ad.linkUrl);
        } else {
          Alert.alert('Hata', 'Bu link açılamıyor');
        }
      }
    } catch (error) {
      console.error('Error handling ad click:', error);
    }
  };

  const handleAdView = async () => {
    try {
      await adService.recordView(ad.id);
    } catch (error) {
      console.error('Error recording ad view:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>Reklam</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={handleAdClick}>
        {ad.adType === 'video' && ad.mediaUrl ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: ad.mediaUrl }}
              style={styles.media}
              resizeMode="contain"
              controls={false}
              paused={true}
              onLoad={handleAdView}
            />
            <View style={styles.playButton}>
              <Icon name="play-circle" size={48} color="#fff" />
            </View>
          </View>
        ) : (
          <Image
            source={{ uri: ad.mediaUrl || ad.image }}
            style={styles.media}
            onLoad={handleAdView}
          />
        )}

        <View style={styles.content}>
          {ad.title && <Text style={styles.title}>{ad.title}</Text>}
          {ad.description && (
            <Text style={styles.description} numberOfLines={2}>
              {ad.description}
            </Text>
          )}
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Ziyaret Et</Text>
            <Icon name="arrow-forward" size={16} color="#0095f6" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  adLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  adLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  media: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  videoContainer: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 8,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ctaText: {
    fontSize: 14,
    color: '#0095f6',
    fontWeight: '600',
    marginRight: 4,
  },
});

