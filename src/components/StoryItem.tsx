import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  username: string;
  avatar?: string;
  hasNewStories?: boolean;
  onPress: () => void;
}

export const StoryItem: React.FC<Props> = ({
  username,
  avatar,
  hasNewStories,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.avatarContainer, hasNewStories && styles.hasNew]}>
        <Image
          source={{ uri: avatar || 'https://via.placeholder.com/60' }}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {username}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dbdbdb',
  },
  hasNew: {
    borderColor: '#ff3040',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  username: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
