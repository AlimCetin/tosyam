import api from './api';
import { Post } from '../types';

export const postService = {
  getFeed: async (page = 1, limit = 20): Promise<{ posts: Post[]; pagination: any }> => {
    const { data } = await api.get('/posts/feed', { params: { page, limit } });
    // Backend artık { posts: [...], pagination: {...} } formatında dönüyor
    return data.posts ? data : { posts: data, pagination: { page, limit, hasMore: false } };
  },

  getPostById: async (postId: string): Promise<Post> => {
    const { data } = await api.get(`/posts/${postId}`);
    return data;
  },

  getUserPosts: async (userId: string, page = 1, limit = 20): Promise<{ posts: Post[]; pagination: any }> => {
    const { data } = await api.get(`/posts/user/${userId}`, { params: { page, limit } });
    // Backend artık { posts: [...], pagination: {...} } formatında dönüyor
    return data.posts ? data : { posts: data, pagination: { page, limit, hasMore: false } };
  },

  createPost: async (image?: string, caption?: string, isPrivate?: boolean, hiddenFromFollowers?: string[], video?: string) => {
    const { data } = await api.post('/posts', { 
      image, 
      video,
      caption,
      isPrivate: isPrivate || false,
      hiddenFromFollowers: hiddenFromFollowers || [],
    });
    return data;
  },

  likePost: async (postId: string) => {
    console.log('📤 Like API çağrısı:', `/posts/${postId}/like`);
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      console.log('✅ Like API yanıtı:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Like API hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  unlikePost: async (postId: string) => {
    console.log('📤 Unlike API çağrısı:', `/posts/${postId}/like`);
    try {
      const { data } = await api.delete(`/posts/${postId}/like`);
      console.log('✅ Unlike API yanıtı:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Unlike API hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  getComments: async (postId: string, page = 1, limit = 20): Promise<{ comments: any[]; pagination: any }> => {
    const { data } = await api.get(`/posts/${postId}/comments`, { params: { page, limit } });
    // Backend artık { comments: [...], pagination: {...} } formatında dönüyor
    return data.comments ? data : { comments: data, pagination: { page, limit, hasMore: false } };
  },

  addComment: async (postId: string, text: string) => {
    const { data } = await api.post(`/posts/${postId}/comments`, { text });
    return data;
  },

  savePost: async (postId: string) => {
    const { data } = await api.post(`/posts/${postId}/save`);
    return data;
  },

  unsavePost: async (postId: string) => {
    const { data } = await api.delete(`/posts/${postId}/save`);
    return data;
  },

  sharePost: async (postId: string) => {
    const { data } = await api.get(`/posts/${postId}/share`);
    return data;
  },

  hidePost: async (postId: string) => {
    const { data } = await api.post(`/posts/${postId}/hide`);
    return data;
  },

  unhidePost: async (postId: string) => {
    const { data } = await api.post(`/posts/${postId}/unhide`);
    return data;
  },

  getLikes: async (postId: string, page = 1, limit = 20): Promise<{ users: any[]; pagination: any }> => {
    const { data } = await api.get(`/posts/${postId}/likes`, { params: { page, limit } });
    return data.users ? data : { users: data, pagination: { page, limit, hasMore: false } };
  },

  deletePost: async (postId: string) => {
    const { data } = await api.delete(`/posts/${postId}`);
    return data;
  },

  updateVisibility: async (postId: string, payload: { isPrivate?: boolean; isHidden?: boolean; hiddenFromFollowers?: string[] }) => {
    const { data } = await api.put(`/posts/${postId}/visibility`, payload);
    return data;
  },
};
