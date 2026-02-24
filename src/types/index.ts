export type ThriftStore = {
  id: string;
  name: string;
  addressLine?: string;
  complement?: string | null;
  description?: string;
  coverImageUrl?: string;
  isOnlineStore?: boolean;
  images?: Array<{
    id: string | number;
    url: string;
    displayOrder?: number;
    isCover?: boolean;
  }>;
  neighborhood?: string;
  badgeLabel?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isFavorite?: boolean | null;
  isPublished?: boolean;
  createdAt?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  categories?: string[];
  contents?: any[];
  distanceMeters?: number | null;
  walkTimeMinutes?: number | null;
};

export type StoreOwner = {
  id: string;
  displayName: string;
  email: string;
  photoUrl: string | null;
  createdAt: string;
};

export type DashboardStoreDetailsResponse = {
  store: ThriftStore;
  owner: StoreOwner | null;
  favoriteUserCount: number;
};

export type DashboardFavoriteUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string | null;
  createdAt: string;
};

export type GuideContent = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thriftStoreId: string;
  thriftStoreName?: string;
  createdAt?: string;
  status?: string;
  likeCount?: number;
  commentCount?: number;
};

export type ContentComment = {
  id: string;
  body: string;
  userId: string;
  userDisplayName?: string;
  userPhotoUrl?: string | null;
  createdAt?: string;
  edited?: boolean;
  contentId?: string;
  contentTitle?: string;
  thriftStoreId?: string;
  thriftStoreName?: string;
};

export type PushToken = {
  id: string;
  deviceId: string;
  platform: string;
  environment: string;
  appVersion: string;
  lastSeenAt: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  status?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  notifyNewStores?: boolean;
  notifyPromos?: boolean;
  ownedThriftStore?: ThriftStore | null;
  pushTokens?: PushToken[];
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize?: number;
  hasNext: boolean;
};

export type ImageModerationStatus =
  | "PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "FLAGGED_FOR_REVIEW"
  | "BLOCKED"
  | "MANUALLY_APPROVED"
  | "MANUALLY_REJECTED"
  | "FAILED";

export type ImageModerationEntityType = "STORE_PHOTO" | "USER_AVATAR" | "GUIDE_CONTENT_IMAGE";

export type ImageModeration = {
  id: number;
  imageUrl: string;
  status: ImageModerationStatus;
  entityType: ImageModerationEntityType;
  entityId: string;
  nsfwScore: number;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  retryCount: number;
};

export type ModerationStats = {
  pending: number;
  processing: number;
  flaggedForReview: number;
  blocked: number;
  approved: number;
  failed: number;
  total: number;
};

export type ModerationPageResponse<T> = {
  content: T[];
  page: number;
  hasNext: boolean;
};
