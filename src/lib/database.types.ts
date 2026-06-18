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
export type MembershipStatus = "pending" | "active" | "rejected" | "suspended";
export type ContentStatus = "draft" | "scheduled" | "published";
export type AssetKind = "image" | "audio";
export type Testament = "OT" | "NT";
export type PlanDifficulty = "starter" | "intermediate" | "deep";
export type GivingInterval = "weekly" | "monthly" | "quarterly" | "annually";
export type GivingRecurringStatus =
  | "pending"
  | "active"
  | "paused"
  | "attention"
  | "cancelled";
export type DonationKind = "one_time" | "recurring";
export type DonationStatus =
  | "pending"
  | "success"
  | "failed"
  | "abandoned"
  | "reversed";
export type HighlightColor = "copper" | "gold" | "sage" | "oxblood" | "blue";

// Community (chat, prayer, ask-pastor, safety, notifications) enums.
export type ChatKind =
  | "house_group"
  | "announcements"
  | "ask_pastor_thread"
  | "discipler"
  | "dm"
  | "parish_group";
export type ChatMemberRole = "member" | "leader" | "pastor" | "discipler";
export type MessageKind = "text" | "voice" | "image" | "system" | "daily_prompt";
export type ReactionEmoji = "🙏" | "❤️" | "amen" | "🔥" | "✋";
export type AskPrivacy = "public" | "private";
export type AskStatus = "awaiting" | "answered";
export type ReportTargetType =
  | "message"
  | "user"
  | "prayer_request"
  | "ask_question";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ModerationSeverity = "low" | "medium" | "high";
export type ModerationAction = "logged" | "soft_deleted" | "escalated";
export type NotificationType =
  | "message"
  | "announcement"
  | "ask_answered"
  | "mention"
  | "daily_prompt"
  | "streak"
  | "prayer"
  | "system";
export type NotificationChannel = "push" | "in_app";
export type PushPlatform = "ios" | "android";
export type VerseImageTheme = "minimal" | "organic" | "bold";
export type VerseImageAspect = "square" | "story";
export type AnnouncementBanner = "event" | "urgent";

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
          campus_id: string | null;
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
          campus_id?: string | null;
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
          campus_id?: string | null;
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
          status: MembershipStatus;
          is_owner: boolean;
          gender: Gender | null;
          year: string | null;
          dept: string | null;
          pinned_verse_ref: string | null;
          joined_at: string;
          discipler_id: string | null;
          campus_id: string | null;
          date_of_birth: string | null;
          phone: string | null;
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
          discipler_id?: string | null;
          campus_id?: string | null;
          date_of_birth?: string | null;
          phone?: string | null;
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
          discipler_id?: string | null;
          campus_id?: string | null;
          date_of_birth?: string | null;
          phone?: string | null;
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
          video_url: string | null;
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
          video_url?: string | null;
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
      campuses: {
        Row: {
          id: string;
          parish_id: string;
          slug: string;
          name: string;
          is_primary: boolean;
          allowed_email_domains: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          slug: string;
          name: string;
          is_primary?: boolean;
          allowed_email_domains?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["campuses"]["Insert"]>;
        Relationships: [];
      };
      streaks: {
        Row: {
          user_id: string;
          current_count: number;
          longest: number;
          last_check_in: string | null;
          grace_used_this_month: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_count?: number;
          longest?: number;
          last_check_in?: string | null;
          grace_used_this_month?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["streaks"]["Insert"]>;
        Relationships: [];
      };
      engagement_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          target_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          target_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["engagement_events"]["Insert"]
        >;
        Relationships: [];
      };
      chats: {
        Row: {
          id: string;
          kind: ChatKind;
          parish_id: string;
          house_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: ChatKind;
          parish_id: string;
          house_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chats"]["Insert"]>;
        Relationships: [];
      };
      chat_members: {
        Row: {
          chat_id: string;
          user_id: string;
          role: ChatMemberRole;
          joined_at: string;
          last_read_at: string | null;
          muted: boolean;
        };
        Insert: {
          chat_id: string;
          user_id: string;
          role?: ChatMemberRole;
          joined_at?: string;
          last_read_at?: string | null;
          muted?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["chat_members"]["Insert"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          author_id: string | null;
          body: string | null;
          voice_url: string | null;
          image_url: string | null;
          kind: MessageKind;
          reply_to_id: string | null;
          edited_at: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          author_id?: string | null;
          body?: string | null;
          voice_url?: string | null;
          image_url?: string | null;
          kind?: MessageKind;
          reply_to_id?: string | null;
          edited_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };
      message_reactions: {
        Row: {
          message_id: string;
          user_id: string;
          emoji: ReactionEmoji;
          created_at: string;
        };
        Insert: {
          message_id: string;
          user_id: string;
          emoji: ReactionEmoji;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["message_reactions"]["Insert"]
        >;
        Relationships: [];
      };
      pinned_messages: {
        Row: {
          chat_id: string;
          message_id: string;
          pinned_by: string | null;
          pinned_at: string;
        };
        Insert: {
          chat_id: string;
          message_id: string;
          pinned_by?: string | null;
          pinned_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["pinned_messages"]["Insert"]
        >;
        Relationships: [];
      };
      prayer_requests: {
        Row: {
          id: string;
          parish_id: string;
          house_id: string | null;
          author_id: string;
          body: string;
          anonymous: boolean;
          urgent: boolean;
          praise: boolean;
          archived_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          house_id?: string | null;
          author_id: string;
          body: string;
          anonymous?: boolean;
          urgent?: boolean;
          praise?: boolean;
          archived_at?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["prayer_requests"]["Insert"]
        >;
        Relationships: [];
      };
      prayer_pray: {
        Row: {
          request_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          request_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["prayer_pray"]["Insert"]>;
        Relationships: [];
      };
      prayer_reactions: {
        Row: {
          request_id: string;
          user_id: string;
          emoji: ReactionEmoji;
          created_at: string;
        };
        Insert: {
          request_id: string;
          user_id: string;
          emoji: ReactionEmoji;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["prayer_reactions"]["Insert"]
        >;
        Relationships: [];
      };
      ask_questions: {
        Row: {
          id: string;
          parish_id: string;
          asker_id: string;
          body: string;
          category: string | null;
          privacy: AskPrivacy;
          urgent: boolean;
          status: AskStatus;
          response_body: string | null;
          answered_by: string | null;
          answered_at: string | null;
          public_anonymized: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          asker_id: string;
          body: string;
          category?: string | null;
          privacy?: AskPrivacy;
          urgent?: boolean;
          status?: AskStatus;
          response_body?: string | null;
          answered_by?: string | null;
          answered_at?: string | null;
          public_anonymized?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["ask_questions"]["Insert"]
        >;
        Relationships: [];
      };
      blocks: {
        Row: {
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blocks"]["Insert"]>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          parish_id: string;
          reporter_id: string;
          target_type: ReportTargetType;
          target_id: string;
          reason: string | null;
          status: ReportStatus;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          reporter_id: string;
          target_type: ReportTargetType;
          target_id: string;
          reason?: string | null;
          status?: ReportStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [];
      };
      moderation_log: {
        Row: {
          id: string;
          message_id: string | null;
          flag: string;
          severity: ModerationSeverity;
          action_taken: ModerationAction;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id?: string | null;
          flag: string;
          severity?: ModerationSeverity;
          action_taken?: ModerationAction;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["moderation_log"]["Insert"]
        >;
        Relationships: [];
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          expo_token: string;
          platform: PushPlatform;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expo_token: string;
          platform: PushPlatform;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["push_tokens"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          preview: string | null;
          target_id: string | null;
          target_url: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          preview?: string | null;
          target_id?: string | null;
          target_url?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          type: string;
          channel: NotificationChannel;
          enabled: boolean;
        };
        Insert: {
          user_id: string;
          type: string;
          channel: NotificationChannel;
          enabled?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["notification_preferences"]["Insert"]
        >;
        Relationships: [];
      };
      verse_images: {
        Row: {
          id: string;
          user_id: string;
          verse_ref: string;
          verse_text: string;
          theme: VerseImageTheme;
          aspect_ratio: VerseImageAspect;
          watermark: boolean;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          verse_ref: string;
          verse_text: string;
          theme?: VerseImageTheme;
          aspect_ratio?: VerseImageAspect;
          watermark?: boolean;
          url: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["verse_images"]["Insert"]>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          parish_id: string;
          title: string;
          body_md: string;
          event_data: Json | null;
          banner: AnnouncementBanner | null;
          photos: string[];
          status: ContentStatus;
          publish_date: string | null;
          posted_at: string | null;
          posted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          title: string;
          body_md?: string;
          event_data?: Json | null;
          banner?: AnnouncementBanner | null;
          photos?: string[];
          status?: ContentStatus;
          publish_date?: string | null;
          posted_at?: string | null;
          posted_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
        Relationships: [];
      };
      reading_plans: {
        Row: {
          id: string;
          parish_id: string;
          slug: string;
          title: string;
          description: string;
          cover_image_url: string | null;
          length_days: number;
          difficulty: PlanDifficulty | null;
          author_id: string | null;
          sequence_locked: boolean;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          slug: string;
          title: string;
          description: string;
          cover_image_url?: string | null;
          length_days: number;
          difficulty?: PlanDifficulty | null;
          author_id?: string | null;
          sequence_locked?: boolean;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["reading_plans"]["Insert"]
        >;
        Relationships: [];
      };
      reading_plan_days: {
        Row: {
          id: string;
          plan_id: string;
          day_number: number;
          title: string;
          scripture_reference: string;
          scripture_text: string | null;
          reflection_body: string;
          reflection_prompt: string;
          audio_url: string | null;
          devotional_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          day_number: number;
          title: string;
          scripture_reference: string;
          scripture_text?: string | null;
          reflection_body: string;
          reflection_prompt: string;
          audio_url?: string | null;
          devotional_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["reading_plan_days"]["Insert"]
        >;
        Relationships: [];
      };
      reading_plan_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          started_at: string;
          current_day: number;
          last_activity_at: string;
          completed_at: string | null;
          paused: boolean;
          streak_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          started_at?: string;
          current_day?: number;
          last_activity_at?: string;
          completed_at?: string | null;
          paused?: boolean;
          streak_enabled?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["reading_plan_subscriptions"]["Insert"]
        >;
        Relationships: [];
      };
      reading_plan_progress: {
        Row: {
          id: string;
          subscription_id: string;
          day_id: string;
          completed_at: string;
          reflection_response: string | null;
          share_with_discipler: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          day_id: string;
          completed_at?: string;
          reflection_response?: string | null;
          share_with_discipler?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["reading_plan_progress"]["Insert"]
        >;
        Relationships: [];
      };
      giving_funds: {
        Row: {
          id: string;
          parish_id: string;
          slug: string;
          name: string;
          description: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          slug: string;
          name: string;
          description?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["giving_funds"]["Insert"]
        >;
        Relationships: [];
      };
      giving_recurring: {
        Row: {
          id: string;
          parish_id: string;
          user_id: string;
          fund_id: string | null;
          amount_kobo: number;
          currency: string;
          interval: GivingInterval;
          status: GivingRecurringStatus;
          anonymous: boolean;
          note: string | null;
          paystack_customer_code: string | null;
          paystack_plan_code: string | null;
          paystack_subscription_code: string | null;
          paystack_email_token: string | null;
          next_payment_at: string | null;
          started_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          user_id: string;
          fund_id?: string | null;
          amount_kobo: number;
          currency?: string;
          interval: GivingInterval;
          status?: GivingRecurringStatus;
          anonymous?: boolean;
          note?: string | null;
          paystack_customer_code?: string | null;
          paystack_plan_code?: string | null;
          paystack_subscription_code?: string | null;
          paystack_email_token?: string | null;
          next_payment_at?: string | null;
          started_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["giving_recurring"]["Insert"]
        >;
        Relationships: [];
      };
      donations: {
        Row: {
          id: string;
          parish_id: string;
          user_id: string;
          fund_id: string | null;
          recurring_id: string | null;
          amount_kobo: number;
          fees_kobo: number | null;
          currency: string;
          kind: DonationKind;
          status: DonationStatus;
          reference: string;
          paystack_reference: string | null;
          channel: string | null;
          anonymous: boolean;
          note: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parish_id: string;
          user_id: string;
          fund_id?: string | null;
          recurring_id?: string | null;
          amount_kobo: number;
          fees_kobo?: number | null;
          currency?: string;
          kind?: DonationKind;
          status?: DonationStatus;
          reference?: string;
          paystack_reference?: string | null;
          channel?: string | null;
          anonymous?: boolean;
          note?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["donations"]["Insert"]>;
        Relationships: [];
      };
      paystack_events: {
        Row: {
          id: string;
          event_type: string;
          reference: string | null;
          paystack_id: string | null;
          signature_valid: boolean;
          processed: boolean;
          error: string | null;
          payload: Json;
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          event_type: string;
          reference?: string | null;
          paystack_id?: string | null;
          signature_valid?: boolean;
          processed?: boolean;
          error?: string | null;
          payload: Json;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["paystack_events"]["Insert"]
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
      public_qa: {
        Row: {
          id: string;
          parish_id: string;
          category: string | null;
          question: string;
          answer: string | null;
          answered_at: string | null;
        };
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
      record_check_in: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["streaks"]["Row"];
      };
      create_dm: {
        Args: { p_other: string };
        Returns: string;
      };
      answer_question: {
        Args: { p_id: string; p_response: string; p_public?: boolean };
        Returns: Database["public"]["Tables"]["ask_questions"]["Row"];
      };
      subscribe_to_plan: {
        Args: { p_plan_id: string };
        Returns: string;
      };
      complete_plan_day: {
        Args: {
          p_day_id: string;
          p_reflection_response?: string;
          p_share_with_discipler?: boolean;
        };
        Returns: string;
      };
      toggle_plan_pause: {
        Args: { p_subscription_id: string };
        Returns: boolean;
      };
      set_my_campus: {
        Args: { p_campus: string };
        Returns: undefined;
      };
      list_pending_members: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        }[];
      };
      approve_member: {
        Args: { p_user: string; p_campus: string };
        Returns: undefined;
      };
      reject_member: {
        Args: { p_user: string };
        Returns: undefined;
      };
      resolve_report: {
        Args: { p_report: string; p_status: string };
        Returns: undefined;
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
export type ReadingPlan = Database["public"]["Tables"]["reading_plans"]["Row"];
export type ReadingPlanDay =
  Database["public"]["Tables"]["reading_plan_days"]["Row"];
export type ReadingPlanSubscription =
  Database["public"]["Tables"]["reading_plan_subscriptions"]["Row"];
export type ReadingPlanProgress =
  Database["public"]["Tables"]["reading_plan_progress"]["Row"];
export type GivingFund = Database["public"]["Tables"]["giving_funds"]["Row"];
export type GivingRecurring =
  Database["public"]["Tables"]["giving_recurring"]["Row"];
export type Donation = Database["public"]["Tables"]["donations"]["Row"];
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
export type Streak = Database["public"]["Tables"]["streaks"]["Row"];
export type EngagementEvent =
  Database["public"]["Tables"]["engagement_events"]["Row"];
export type Chat = Database["public"]["Tables"]["chats"]["Row"];
export type ChatMember = Database["public"]["Tables"]["chat_members"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageReaction =
  Database["public"]["Tables"]["message_reactions"]["Row"];
export type PinnedMessage =
  Database["public"]["Tables"]["pinned_messages"]["Row"];
export type PrayerRequest =
  Database["public"]["Tables"]["prayer_requests"]["Row"];
export type PrayerPray = Database["public"]["Tables"]["prayer_pray"]["Row"];
export type PrayerReaction =
  Database["public"]["Tables"]["prayer_reactions"]["Row"];
export type AskQuestion =
  Database["public"]["Tables"]["ask_questions"]["Row"];
export type PublicQa = Database["public"]["Views"]["public_qa"]["Row"];
export type Block = Database["public"]["Tables"]["blocks"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ModerationLog =
  Database["public"]["Tables"]["moderation_log"]["Row"];
export type PushToken = Database["public"]["Tables"]["push_tokens"]["Row"];
export type Notification =
  Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationPreference =
  Database["public"]["Tables"]["notification_preferences"]["Row"];
export type VerseImage = Database["public"]["Tables"]["verse_images"]["Row"];
export type Announcement =
  Database["public"]["Tables"]["announcements"]["Row"];
export type Campus = Database["public"]["Tables"]["campuses"]["Row"];

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
