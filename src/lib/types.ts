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
