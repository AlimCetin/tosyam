import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { postService } from '../services/postService';
import { Comment } from '../types';

export const CommentsScreen: React.FC = () => {
  const route = useRoute<any>();
  const headerHeight = useHeaderHeight();
  const { postId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    loadComments();
  }, [postId]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => {
        if (Platform.OS === 'android') {
          setKeyboardHeight(e.endCoordinates.height);
        }
      }
    );

    const hideSub = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        if (Platform.OS === 'android') {
          setKeyboardHeight(0);
        }
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const loadComments = async () => {
    try {
      const response = await postService.getComments(postId);
      const commentsData = response.comments || response; // Backward compatibility
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error);
    }
  };

  const handleAddComment = async () => {
    if (!text.trim()) return;

    try {
      await postService.addComment(postId, text);
      setText('');
      await loadComments(); // Sayfayı yenile ve doğru sırayı getir
    } catch (error) {
      console.error('Yorum eklenemedi:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <View style={[styles.innerContainer, Platform.OS === 'android' && { paddingBottom: keyboardHeight }]}>
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const user = item.user || { username: 'Unknown', avatar: null };
            return (
              <View style={styles.comment}>
                <Image
                  source={{
                    uri: user.avatar || 'https://via.placeholder.com/40',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.commentText}>
                    <Text style={styles.username}>
                      {user.username || user.fullName || 'Unknown'}{' '}
                    </Text>
                    {item.text}
                  </Text>
                  <Text style={styles.time}>
                    {new Date(item.createdAt).toLocaleDateString('tr-TR')} {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Henüz yorum yok</Text>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Yorum ekle..."
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Text style={styles.sendButton}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
  },
  comment: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#8e8e8e',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8e8e8e',
  },
});
