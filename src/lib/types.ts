export interface Video {
  id: string;
  title_en?: string;
  title_ar?: string;
  title?: string;
  description_en?: string;
  description_ar?: string;
  description?: string;
  thumbnail: string;
  category: string;
  year: number;
  duration: string;
  type: "movie" | "episode";
  video_url: string;
  published: boolean;
  is_soon?: boolean;
  price?: number;
}

export interface VideoAccessRequest {
  id: string;
  user_id: string;
  video_id: string;
  email: string;
  mobile: string;
  price: number;
  status: 'pending' | 'contacted' | 'paid' | 'rejected';
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  video?: Video;
  user?: any;
}

export interface VideoAccessGrant {
  id: string;
  user_id: string;
  video_id: string;
  request_id?: string | null;
  granted_by?: string | null;
  granted_at: string;
  expires_at?: string | null;
  revoked_at?: string | null;
  video?: Video;
}

export interface Category {
  id: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
}

export interface Guest {
  id: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
  bio_en?: string | null;
  bio_ar?: string | null;
  bio?: string | null;
  image_url: string | null;
}

export interface Presenter {
  id: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
  bio_en?: string | null;
  bio_ar?: string | null;
  bio?: string | null;
  image_url: string | null;
}

export interface Channel {
  id: string;
  name_en?: string;
  name_ar?: string;
  name?: string;
  description_en?: string | null;
  description_ar?: string | null;
  description?: string | null;
  logo_url: string | null;
}

export interface Podcast {
  id: string;
  title_en?: string;
  title_ar?: string;
  title?: string;
  description_en?: string;
  description_ar?: string;
  description?: string;
  thumbnail: string;
  video_url: string;
  episode_number: number | null;
  duration: string | null;
  release_date: string | null;
  guest_id: string | null;
  presenter_id: string | null;
  published: boolean;
  is_soon?: boolean;
}

export interface UserList {
  id: string;
  user_id: string;
  content_id: string;
  content_type: "video" | "podcast";
}
