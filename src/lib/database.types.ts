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
export type Testament = "OT" | "NT";
export type HighlightColor = "copper" | "gold" | "sage" | "oxblood" | "blue";

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
      bible_versions: {
        Row: {
          id: string;
          code: string;
          name: string;
          language: string;
          license: string | null;
          version: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          language?: string;
          license?: string | null;
          version?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["bible_versions"]["Insert"]
        >;
        Relationships: [];
      };
      bible_books: {
        Row: {
          id: string;
          version_id: string;
          name: string;
          abbrev: string;
          testament: Testament;
          book_order: number;
        };
        Insert: {
          id?: string;
          version_id: string;
          name: string;
          abbrev: string;
          testament: Testament;
          book_order: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["bible_books"]["Insert"]
        >;
        Relationships: [];
      };
      bible_chapters: {
        Row: {
          id: string;
          book_id: string;
          number: number;
          verse_count: number;
        };
        Insert: {
          id?: string;
          book_id: string;
          number: number;
          verse_count?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["bible_chapters"]["Insert"]
        >;
        Relationships: [];
      };
      bible_verses: {
        Row: {
          id: string;
          chapter_id: string;
          number: number;
          text: string;
          search_vector: unknown | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          number: number;
          text: string;
          search_vector?: unknown | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["bible_verses"]["Insert"]
        >;
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string | null;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id?: string | null;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notes"]["Insert"]>;
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookmarks"]["Insert"]>;
        Relationships: [];
      };
      highlights: {
        Row: {
          id: string;
          user_id: string;
          verse_id: string;
          color: HighlightColor;
          note_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_id: string;
          color?: HighlightColor;
          note_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["highlights"]["Insert"]>;
        Relationships: [];
      };
      reading_position: {
        Row: {
          user_id: string;
          version_id: string | null;
          book_id: string | null;
          chapter_number: number | null;
          verse_number: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          version_id?: string | null;
          book_id?: string | null;
          chapter_number?: number | null;
          verse_number?: number | null;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["reading_position"]["Insert"]
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
    Functions: {
      get_chapter: {
        Args: {
          version_code: string;
          book_abbrev: string;
          chapter_number: number;
        };
        Returns: ChapterPayload;
      };
      search_bible: {
        Args: {
          query: string;
          version_code?: string;
          max_results?: number;
        };
        Returns: SearchResult[];
      };
      parse_reference: {
        Args: { ref: string; version_code?: string };
        Returns: {
          book_id: string;
          book_name: string;
          chapter: number;
          verse: number;
        }[];
      };
    };
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
export type BibleVersion =
  Database["public"]["Tables"]["bible_versions"]["Row"];
export type BibleBook = Database["public"]["Tables"]["bible_books"]["Row"];
export type BibleChapter =
  Database["public"]["Tables"]["bible_chapters"]["Row"];
export type BibleVerse = Database["public"]["Tables"]["bible_verses"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type Highlight = Database["public"]["Tables"]["highlights"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type ReadingPosition =
  Database["public"]["Tables"]["reading_position"]["Row"];

// Shape returned by the get_chapter() RPC (jsonb).
export type ChapterVerse = { number: number; text: string };
export type ChapterPayload = {
  version: string;
  book: string;
  abbrev: string;
  chapter: number;
  reference: string;
  verse_count: number;
  verses: ChapterVerse[];
} | null;

// Row shape returned by the search_bible() RPC.
export type SearchResult = {
  verse_id: string;
  reference: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  rank: number;
};
