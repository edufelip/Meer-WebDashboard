export type ThriftStore = {
  id: string;
  name: string;
  addressLine?: string;
  description?: string;
  tagline?: string;
  coverImageUrl?: string;
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

export type GuideContent = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  thriftStoreId: string;
  thriftStoreName?: string;
  createdAt?: string;
  status?: string;
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
};

export type PageResponse<T> = {
  items: T[];
  page: number;
  pageSize?: number;
  hasNext: boolean;
};
