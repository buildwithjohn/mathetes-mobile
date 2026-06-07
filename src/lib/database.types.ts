// Database types for Mathetes.
//
// These mirror the backend schema (mathetes-backend migration 0001). After
// future migrations, regenerate from the backend:
//   cd ../mathetes-backend && ./scripts/generate-types.sh
// which copies the generated file here. Until the full generator runs, these
// hand-authored shapes keep the app type-safe without `any`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PhotoVisibility = "parish" | "house" | "none";
export type UserRole =
  | "member"
  | "house_leader"
  | "discipler"
  | "pastor"
  | "admin";
export type Gender = "male" | "female";
export type DmWho = "all_parish" | "house" | "discipler" | "none";
export type ContentStatus = "draft" | "scheduled" | "published";
export type AssetKind = "image" | "audio";

export interface Database {
  public: {
    Tables: {
      parishes: {
        Row: {
          id: string;
          slug: string;
          name: string;
          abbr: string;
          campus_name: string | null;
          network_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          abbr: string;
          campus_name?: string | null;
          network_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          abbr?: string;
          campus_name?: string | null;
          network_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      houses: {
        Row: {
          id: string;
          parish_id: string;
          slug: string;
          name: string;
          color: string;
          verse: string | null;
          verse_ref: string | null;
          leader_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          slug: string;
          name: string;
          color: string;
          verse?: string | null;
          verse_ref?: string | null;
          leader_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          parish_id?: string;
          slug?: string;
          name?: string;
          color?: string;
          verse?: string | null;
          verse_ref?: string | null;
          leader_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          auth_id: string;
          parish_id: string | null;
          house_id: string | null;
          name: string;
          photo_url: string | null;
          photo_visibility: PhotoVisibility;
          role: UserRole;
          gender: Gender | null;
          year: string | null;
          dept: string | null;
          pinned_verse_ref: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          parish_id?: string | null;
          house_id?: string | null;
          name: string;
          photo_url?: string | null;
          photo_visibility?: PhotoVisibility;
          role?: UserRole;
          gender?: Gender | null;
          year?: string | null;
          dept?: string | null;
          pinned_verse_ref?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          parish_id?: string | null;
          house_id?: string | null;
          name?: string;
          photo_url?: string | null;
          photo_visibility?: PhotoVisibility;
          role?: UserRole;
          gender?: Gender | null;
          year?: string | null;
          dept?: string | null;
          pinned_verse_ref?: string | null;
          joined_at?: string;
        };
        Relationships: [];
      };
      user_privacy: {
        Row: {
          user_id: string;
          dm_who: DmWho;
          cross_gender_dm_approval: boolean;
          mentions_notify: boolean;
        };
        Insert: {
          user_id: string;
          dm_who?: DmWho;
          cross_gender_dm_approval?: boolean;
          mentions_notify?: boolean;
        };
        Update: {
          user_id?: string;
          dm_who?: DmWho;
          cross_gender_dm_approval?: boolean;
          mentions_notify?: boolean;
        };
        Relationships: [];
      };
      devotional_series: {
        Row: {
          id: string;
          parish_id: string;
          title: string;
          description: string | null;
          total_days: number | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          title: string;
          description?: string | null;
          total_days?: number | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["devotional_series"]["Insert"]
        >;
        Relationships: [];
      };
      devotionals: {
        Row: {
          id: string;
          parish_id: string;
          series_id: string | null;
          day_in_series: number | null;
          title: string;
          body_md: string;
          scripture_refs: string[];
          reading_time_minutes: number | null;
          audio_url: string | null;
          author_id: string | null;
          publish_date: string | null;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          series_id?: string | null;
          day_in_series?: number | null;
          title: string;
          body_md?: string;
          scripture_refs?: string[];
          reading_time_minutes?: number | null;
          audio_url?: string | null;
          author_id?: string | null;
          publish_date?: string | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["devotionals"]["Insert"]
        >;
        Relationships: [];
      };
      word_of_day: {
        Row: {
          id: string;
          parish_id: string;
          verse_ref: string;
          verse_text: string;
          reflection_md: string | null;
          prompt: string | null;
          author_id: string | null;
          publish_date: string | null;
          status: ContentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          verse_ref: string;
          verse_text: string;
          reflection_md?: string | null;
          prompt?: string | null;
          author_id?: string | null;
          publish_date?: string | null;
          status?: ContentStatus;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["word_of_day"]["Insert"]
        >;
        Relationships: [];
      };
      content_assets: {
        Row: {
          id: string;
          devotional_id: string | null;
          word_of_day_id: string | null;
          url: string;
          kind: AssetKind;
          created_at: string;
        };
        Insert: {
          id?: string;
          devotional_id?: string | null;
          word_of_day_id?: string | null;
          url: string;
          kind: AssetKind;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["content_assets"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: {
      todays_word_of_day: {
        Row: Database["public"]["Tables"]["word_of_day"]["Row"];
        Relationships: [];
      };
      todays_devotional: {
        Row: Database["public"]["Tables"]["devotionals"]["Row"];
        Relationships: [];
      };
    };
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: {
      photo_visibility: PhotoVisibility;
      user_role: UserRole;
      gender: Gender;
      dm_who: DmWho;
    };
    CompositeTypes: Record<string, Record<string, unknown>>;
  };
}

// Convenience row aliases.
export type Parish = Database["public"]["Tables"]["parishes"]["Row"];
export type House = Database["public"]["Tables"]["houses"]["Row"];
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type UserPrivacy = Database["public"]["Tables"]["user_privacy"]["Row"];
export type DevotionalSeries =
  Database["public"]["Tables"]["devotional_series"]["Row"];
export type Devotional = Database["public"]["Tables"]["devotionals"]["Row"];
export type WordOfDay = Database["public"]["Tables"]["word_of_day"]["Row"];
export type ContentAsset =
  Database["public"]["Tables"]["content_assets"]["Row"];
