export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  hideFollowers?: boolean;
  hideFollowing?: boolean;
  hiddenFollowers?: string[];
  hiddenFollowing?: string[];
  role?: 'user' | 'moderator' | 'admin' | 'super_admin';
  warningCount?: number;
  bannedUntil?: string;
  isPermanentlyBanned?: boolean;
}

export interface Post {
  id: string;
  type?: 'post' | 'ad';
  userId?: string;
  user?: User;
  image?: string;
  video?: string;
  caption?: string;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isHidden?: boolean;
  isPrivate?: boolean;
  hiddenFromFollowers?: string[];
  createdAt: string;
  // Ad fields
  title?: string;
  description?: string;
  mediaUrl?: string;
  linkUrl?: string;
  adType?: 'image' | 'video';
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Confession {
  id: string;
  text: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface ConfessionComment {
  id: string;
  text: string;
  userInitials: string;
  createdAt: string;
}

export interface Message {
  id: string;
  _id?: string;
  conversationId?: string;
  senderId: string;
  receiverId: string;
  text: string;
  image?: string;
  createdAt: string;
  read: boolean;
  sender?: {
    id: string;
    _id?: string;
    fullName: string;
    username: string;
    avatar?: string | null;
  };
}

export interface Conversation {
  id: string;
  _id?: string; // Backend'den gelebilir
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  fromUser: User;
  postId?: string;
  commentId?: string;
  messageId?: string;
  postOwnerName?: string; // Takipçi bildirimlerinde post sahibinin adı
  isFollowerNotification?: boolean; // Takipçi bildirimi mi?
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  type: 'user' | 'post' | 'comment' | 'message';
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'copyright' | 'fake_news' | 'hate_speech' | 'other';
  description?: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reporter?: User;
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
  reportCount?: number;
  createdAt: string;
  reportedItem?: {
    id: string;
    // For posts
    image?: string;
    video?: string;
    caption?: string;
    userId?: string;
    // For users
    fullName?: string;
    avatar?: string;
    bio?: string;
    // For comments and messages
    text?: string;
    content?: string;
    postId?: string;
    senderId?: string;
    conversationId?: string;
  };
}

export interface Ad {
  id: string;
  title: string;
  type: 'image' | 'video';
  mediaUrl: string;
  linkUrl: string;
  description?: string;
  status: 'active' | 'paused' | 'expired' | 'draft';
  startDate: string;
  endDate: string;
  clickCount: number;
  viewCount: number;
  impressionCount: number;
  createdBy?: string;
  maxImpressions?: number;
  budget?: number;
  spentAmount?: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  activityType: string;
  targetUserId?: string;
  targetPostId?: string;
  targetReportId?: string;
  targetAdId?: string;
  description: string;
  metadata?: any;
  admin?: User;
  targetUser?: User;
  createdAt: string;
}
