export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          sport_type: Database["public"]["Enums"]["profile_sport_type"] | null;
          total_xp: number;
          current_streak: number;
          longest_streak: number;
          mystery_boxes_available: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          sport_type?: Database["public"]["Enums"]["profile_sport_type"] | null;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          mystery_boxes_available?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          sport_type?: Database["public"]["Enums"]["profile_sport_type"] | null;
          total_xp?: number;
          current_streak?: number;
          longest_streak?: number;
          mystery_boxes_available?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      campuses: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          campus_type: Database["public"]["Enums"]["campus_type"];
          domain: string | null;
          location: unknown | null;
          latitude: number | null;
          longitude: number | null;
          zip_code: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          timezone: string;
          enrollment: number;
          primary_color: string | null;
          secondary_color: string | null;
          logo_url: string | null;
          banner_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          campus_type: Database["public"]["Enums"]["campus_type"];
          domain?: string | null;
          location?: unknown | null;
          latitude?: number | null;
          longitude?: number | null;
          zip_code?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          timezone?: string;
          enrollment?: number;
          primary_color?: string | null;
          secondary_color?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          campus_type?: Database["public"]["Enums"]["campus_type"];
          domain?: string | null;
          location?: unknown | null;
          latitude?: number | null;
          longitude?: number | null;
          zip_code?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          timezone?: string;
          enrollment?: number;
          primary_color?: string | null;
          secondary_color?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      campus_memberships: {
        Row: {
          id: string;
          user_id: string;
          campus_id: string;
          role: Database["public"]["Enums"]["campus_role"];
          joined_at: string;
          left_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          campus_id: string;
          role?: Database["public"]["Enums"]["campus_role"];
          joined_at?: string;
          left_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          campus_id?: string;
          role?: Database["public"]["Enums"]["campus_role"];
          joined_at?: string;
          left_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campus_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campus_memberships_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      squads: {
        Row: {
          id: string;
          campus_id: string;
          name: string;
          squad_type: Database["public"]["Enums"]["squad_type"];
          sport_type: Database["public"]["Enums"]["profile_sport_type"] | null;
          description: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          member_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          name: string;
          squad_type: Database["public"]["Enums"]["squad_type"];
          sport_type?: Database["public"]["Enums"]["profile_sport_type"] | null;
          description?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          member_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          name?: string;
          squad_type?: Database["public"]["Enums"]["squad_type"];
          sport_type?: Database["public"]["Enums"]["profile_sport_type"] | null;
          description?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          member_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "squads_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      squad_members: {
        Row: {
          id: string;
          squad_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["squad_role"];
          joined_at: string;
          left_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          squad_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["squad_role"];
          joined_at?: string;
          left_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          squad_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["squad_role"];
          joined_at?: string;
          left_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey";
            columns: ["squad_id"];
            isOneToOne: false;
            referencedRelation: "squads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "squad_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      athletics_events: {
        Row: {
          id: string;
          campus_id: string;
          sport_type: Database["public"]["Enums"]["profile_sport_type"];
          opponent_name: string;
          event_date: string;
          location: string | null;
          is_home_game: boolean;
          expected_attendance: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          sport_type: Database["public"]["Enums"]["profile_sport_type"];
          opponent_name: string;
          event_date: string;
          location?: string | null;
          is_home_game?: boolean;
          expected_attendance?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          sport_type?: Database["public"]["Enums"]["profile_sport_type"];
          opponent_name?: string;
          event_date?: string;
          location?: string | null;
          is_home_game?: boolean;
          expected_attendance?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "athletics_events_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      polls: {
        Row: {
          id: string;
          campus_id: string;
          author_id: string;
          question: string;
          category: Database["public"]["Enums"]["poll_category"];
          image_url: string | null;
          closes_at: string;
          is_active: boolean;
          total_votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          author_id: string;
          question: string;
          category: Database["public"]["Enums"]["poll_category"];
          image_url?: string | null;
          closes_at: string;
          is_active?: boolean;
          total_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          author_id?: string;
          question?: string;
          category?: Database["public"]["Enums"]["poll_category"];
          image_url?: string | null;
          closes_at?: string;
          is_active?: boolean;
          total_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "polls_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "polls_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          option_text: string;
          vote_count: number;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_text: string;
          vote_count?: number;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_text?: string;
          vote_count?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          }
        ];
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string;
          option_id: string;
          points_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          user_id: string;
          option_id: string;
          points_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          user_id?: string;
          option_id?: string;
          points_awarded?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "poll_votes_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "poll_options";
            referencedColumns: ["id"];
          }
        ];
      };
      heists: {
        Row: {
          id: string;
          campus_id: string;
          title: string;
          description: string;
          phase: Database["public"]["Enums"]["heist_phase"];
          image_url: string | null;
          submission_opens_at: string;
          submission_closes_at: string;
          voting_opens_at: string;
          voting_closes_at: string;
          execution_week_start: string | null;
          execution_week_end: string | null;
          winner_submission_id: string | null;
          total_submissions: number;
          total_votes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          title: string;
          description: string;
          phase?: Database["public"]["Enums"]["heist_phase"];
          image_url?: string | null;
          submission_opens_at: string;
          submission_closes_at: string;
          voting_opens_at: string;
          voting_closes_at: string;
          execution_week_start?: string | null;
          execution_week_end?: string | null;
          winner_submission_id?: string | null;
          total_submissions?: number;
          total_votes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          title?: string;
          description?: string;
          phase?: Database["public"]["Enums"]["heist_phase"];
          image_url?: string | null;
          submission_opens_at?: string;
          submission_closes_at?: string;
          voting_opens_at?: string;
          voting_closes_at?: string;
          execution_week_start?: string | null;
          execution_week_end?: string | null;
          winner_submission_id?: string | null;
          total_submissions?: number;
          total_votes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "heists_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "heists_winner_submission_id_fkey";
            columns: ["winner_submission_id"];
            isOneToOne: false;
            referencedRelation: "heist_submissions";
            referencedColumns: ["id"];
          }
        ];
      };
      heist_submissions: {
        Row: {
          id: string;
          heist_id: string;
          user_id: string;
          title: string;
          description: string;
          image_url: string | null;
          video_url: string | null;
          vote_count: number;
          is_winner: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          heist_id: string;
          user_id: string;
          title: string;
          description: string;
          image_url?: string | null;
          video_url?: string | null;
          vote_count?: number;
          is_winner?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          heist_id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          image_url?: string | null;
          video_url?: string | null;
          vote_count?: number;
          is_winner?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "heist_submissions_heist_id_fkey";
            columns: ["heist_id"];
            isOneToOne: false;
            referencedRelation: "heists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "heist_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      heist_votes: {
        Row: {
          id: string;
          heist_id: string;
          submission_id: string;
          user_id: string;
          reaction_type: Database["public"]["Enums"]["reaction_type"];
          points_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          heist_id: string;
          submission_id: string;
          user_id: string;
          reaction_type: Database["public"]["Enums"]["reaction_type"];
          points_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          heist_id?: string;
          submission_id?: string;
          user_id?: string;
          reaction_type?: Database["public"]["Enums"]["reaction_type"];
          points_awarded?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "heist_votes_heist_id_fkey";
            columns: ["heist_id"];
            isOneToOne: false;
            referencedRelation: "heists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "heist_votes_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "heist_submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "heist_votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      moments: {
        Row: {
          id: string;
          campus_id: string;
          user_id: string;
          squad_id: string | null;
          athletics_event_id: string | null;
          caption: string | null;
          video_url: string;
          thumbnail_url: string | null;
          source: Database["public"]["Enums"]["moment_source"];
          view_count: number;
          reaction_count: number;
          comment_count: number;
          is_active: boolean;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          user_id: string;
          squad_id?: string | null;
          athletics_event_id?: string | null;
          caption?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          source: Database["public"]["Enums"]["moment_source"];
          view_count?: number;
          reaction_count?: number;
          comment_count?: number;
          is_active?: boolean;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          user_id?: string;
          squad_id?: string | null;
          athletics_event_id?: string | null;
          caption?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          source?: Database["public"]["Enums"]["moment_source"];
          view_count?: number;
          reaction_count?: number;
          comment_count?: number;
          is_active?: boolean;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moments_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moments_squad_id_fkey";
            columns: ["squad_id"];
            isOneToOne: false;
            referencedRelation: "squads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moments_athletics_event_id_fkey";
            columns: ["athletics_event_id"];
            isOneToOne: false;
            referencedRelation: "athletics_events";
            referencedColumns: ["id"];
          }
        ];
      };
      bell_events: {
        Row: {
          id: string;
          campus_id: string;
          triggered_at: string;
          expires_at: string;
          participants_count: number;
          moments_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          triggered_at: string;
          expires_at: string;
          participants_count?: number;
          moments_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          triggered_at?: string;
          expires_at?: string;
          participants_count?: number;
          moments_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bell_events_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      reactions: {
        Row: {
          id: string;
          moment_id: string;
          user_id: string;
          reaction_type: Database["public"]["Enums"]["reaction_type"];
          points_awarded: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          moment_id: string;
          user_id: string;
          reaction_type: Database["public"]["Enums"]["reaction_type"];
          points_awarded?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          moment_id?: string;
          user_id?: string;
          reaction_type?: Database["public"]["Enums"]["reaction_type"];
          points_awarded?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_moment_id_fkey";
            columns: ["moment_id"];
            isOneToOne: false;
            referencedRelation: "moments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          streak_type: Database["public"]["Enums"]["streak_type"];
          current_streak: number;
          longest_streak: number;
          last_activity_at: string | null;
          grace_period_used: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          streak_type: Database["public"]["Enums"]["streak_type"];
          current_streak?: number;
          longest_streak?: number;
          last_activity_at?: string | null;
          grace_period_used?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          streak_type?: Database["public"]["Enums"]["streak_type"];
          current_streak?: number;
          longest_streak?: number;
          last_activity_at?: string | null;
          grace_period_used?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_xp: {
        Row: {
          id: string;
          user_id: string;
          xp_amount: number;
          source: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xp_amount: number;
          source: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          xp_amount?: number;
          source?: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_xp_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      mystery_boxes: {
        Row: {
          id: string;
          user_id: string;
          box_type: string;
          is_opened: boolean;
          reward_type: Database["public"]["Enums"]["reward_type"] | null;
          reward_value: Json | null;
          opened_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          box_type: string;
          is_opened?: boolean;
          reward_type?: Database["public"]["Enums"]["reward_type"] | null;
          reward_value?: Json | null;
          opened_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          box_type?: string;
          is_opened?: boolean;
          reward_type?: Database["public"]["Enums"]["reward_type"] | null;
          reward_value?: Json | null;
          opened_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mystery_boxes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_rewards: {
        Row: {
          id: string;
          user_id: string;
          reward_type: Database["public"]["Enums"]["reward_type"];
          reward_value: Json;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reward_type: Database["public"]["Enums"]["reward_type"];
          reward_value: Json;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reward_type?: Database["public"]["Enums"]["reward_type"];
          reward_value?: Json;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_rewards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      sponsors: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          website_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          website_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sponsor_offers: {
        Row: {
          id: string;
          sponsor_id: string;
          campus_id: string | null;
          title: string;
          description: string;
          offer_type: Database["public"]["Enums"]["offer_type"];
          offer_value: Json;
          image_url: string | null;
          start_date: string;
          end_date: string;
          max_redemptions: number | null;
          redemption_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sponsor_id: string;
          campus_id?: string | null;
          title: string;
          description: string;
          offer_type: Database["public"]["Enums"]["offer_type"];
          offer_value: Json;
          image_url?: string | null;
          start_date: string;
          end_date: string;
          max_redemptions?: number | null;
          redemption_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sponsor_id?: string;
          campus_id?: string | null;
          title?: string;
          description?: string;
          offer_type?: Database["public"]["Enums"]["offer_type"];
          offer_value?: Json;
          image_url?: string | null;
          start_date?: string;
          end_date?: string;
          max_redemptions?: number | null;
          redemption_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sponsor_offers_sponsor_id_fkey";
            columns: ["sponsor_id"];
            isOneToOne: false;
            referencedRelation: "sponsors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sponsor_offers_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      campus_weekly_stats: {
        Row: {
          id: string;
          campus_id: string;
          week_start_date: string;
          total_users: number;
          active_users: number;
          total_moments: number;
          total_polls: number;
          total_heist_submissions: number;
          total_reactions: number;
          total_xp_awarded: number;
          engagement_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          week_start_date: string;
          total_users?: number;
          active_users?: number;
          total_moments?: number;
          total_polls?: number;
          total_heist_submissions?: number;
          total_reactions?: number;
          total_xp_awarded?: number;
          engagement_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          week_start_date?: string;
          total_users?: number;
          active_users?: number;
          total_moments?: number;
          total_polls?: number;
          total_heist_submissions?: number;
          total_reactions?: number;
          total_xp_awarded?: number;
          engagement_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campus_weekly_stats_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      campus_legacy_stats: {
        Row: {
          id: string;
          campus_id: string;
          total_users_all_time: number;
          total_moments_all_time: number;
          total_polls_all_time: number;
          total_heist_submissions_all_time: number;
          total_reactions_all_time: number;
          total_xp_awarded_all_time: number;
          longest_streak_record: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campus_id: string;
          total_users_all_time?: number;
          total_moments_all_time?: number;
          total_polls_all_time?: number;
          total_heist_submissions_all_time?: number;
          total_reactions_all_time?: number;
          total_xp_awarded_all_time?: number;
          longest_streak_record?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campus_id?: string;
          total_users_all_time?: number;
          total_moments_all_time?: number;
          total_polls_all_time?: number;
          total_heist_submissions_all_time?: number;
          total_reactions_all_time?: number;
          total_xp_awarded_all_time?: number;
          longest_streak_record?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campus_legacy_stats_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: true;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      moderation_queue: {
        Row: {
          id: string;
          content_type: Database["public"]["Enums"]["moderation_content_type"];
          content_id: string;
          campus_id: string;
          reporter_id: string | null;
          status: Database["public"]["Enums"]["moderation_status"];
          reason: string | null;
          moderator_id: string | null;
          decision: Database["public"]["Enums"]["moderation_decision_type"] | null;
          decision_notes: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content_type: Database["public"]["Enums"]["moderation_content_type"];
          content_id: string;
          campus_id: string;
          reporter_id?: string | null;
          status?: Database["public"]["Enums"]["moderation_status"];
          reason?: string | null;
          moderator_id?: string | null;
          decision?: Database["public"]["Enums"]["moderation_decision_type"] | null;
          decision_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content_type?: Database["public"]["Enums"]["moderation_content_type"];
          content_id?: string;
          campus_id?: string;
          reporter_id?: string | null;
          status?: Database["public"]["Enums"]["moderation_status"];
          reason?: string | null;
          moderator_id?: string | null;
          decision?: Database["public"]["Enums"]["moderation_decision_type"] | null;
          decision_notes?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moderation_queue_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moderation_queue_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moderation_queue_moderator_id_fkey";
            columns: ["moderator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          event_name: string;
          category: string;
          user_id: string | null;
          campus_id: string | null;
          session_id: string;
          properties: Json;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          category: string;
          user_id?: string | null;
          campus_id?: string | null;
          session_id: string;
          properties?: Json;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          category?: string;
          user_id?: string | null;
          campus_id?: string | null;
          session_id?: string;
          properties?: Json;
          timestamp?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          campus_id: string | null;
          start_time: string;
          end_time: string | null;
          duration_seconds: number | null;
          device_info: Json;
          location_info: Json;
          event_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          campus_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          duration_seconds?: number | null;
          device_info?: Json;
          location_info?: Json;
          event_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          campus_id?: string | null;
          start_time?: string;
          end_time?: string | null;
          duration_seconds?: number | null;
          device_info?: Json;
          location_info?: Json;
          event_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_sessions_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_user_properties: {
        Row: {
          id: string;
          user_id: string;
          property_name: string;
          property_value: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_name: string;
          property_value: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          property_name?: string;
          property_value?: string;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_user_properties_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_feature_usage: {
        Row: {
          id: string;
          feature_name: string;
          user_id: string | null;
          campus_id: string | null;
          usage_count: number;
          last_used: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          feature_name: string;
          user_id?: string | null;
          campus_id?: string | null;
          usage_count?: number;
          last_used?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          feature_name?: string;
          user_id?: string | null;
          campus_id?: string | null;
          usage_count?: number;
          last_used?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_feature_usage_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_feature_usage_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_funnels: {
        Row: {
          id: string;
          funnel_name: string;
          user_id: string | null;
          campus_id: string | null;
          step_name: string;
          step_number: number;
          properties: Json;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          funnel_name: string;
          user_id?: string | null;
          campus_id?: string | null;
          step_name: string;
          step_number: number;
          properties?: Json;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          funnel_name?: string;
          user_id?: string | null;
          campus_id?: string | null;
          step_name?: string;
          step_number?: number;
          properties?: Json;
          timestamp?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_funnels_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_funnels_campus_id_fkey";
            columns: ["campus_id"];
            isOneToOne: false;
            referencedRelation: "campuses";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_reports: {
        Row: {
          id: string;
          report_name: string;
          report_type: string;
          parameters: Json;
          data: Json;
          generated_by: string | null;
          generated_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_name: string;
          report_type: string;
          parameters?: Json;
          data: Json;
          generated_by?: string | null;
          generated_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_name?: string;
          report_type?: string;
          parameters?: Json;
          data?: Json;
          generated_by?: string | null;
          generated_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_reports_generated_by_fkey";
            columns: ["generated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          id: string;
          phone: string;
          created_at: string;
          last_sign_in_at: string | null;
          is_banned: boolean;
        };
        Insert: {
          id?: string;
          phone: string;
          created_at?: string;
          last_sign_in_at?: string | null;
          is_banned?: boolean;
        };
        Update: {
          id?: string;
          phone?: string;
          created_at?: string;
          last_sign_in_at?: string | null;
          is_banned?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      profile_sport_type:
        | 'football'
        | 'basketball'
        | 'soccer'
        | 'baseball'
        | 'softball'
        | 'track'
        | 'volleyball'
        | 'tennis'
        | 'swimming'
        | 'golf'
        | 'lacrosse'
        | 'hockey'
        | 'wrestling'
        | 'cross_country'
        | 'gymnastics'
        | 'cheer'
        | 'band'
        | 'other';
      campus_type:
        | 'university'
        | 'college'
        | 'high_school'
        | 'community_college';
      squad_type:
        | 'sports'
        | 'club'
        | 'greek'
        | 'residence'
        | 'academic'
        | 'social';
      squad_role:
        | 'member'
        | 'captain'
        | 'co_captain';
      poll_category:
        | 'sports'
        | 'campus_life'
        | 'food'
        | 'entertainment'
        | 'academics'
        | 'weekend_plans';
      heist_phase:
        | 'submitting'
        | 'voting'
        | 'won'
        | 'executing'
        | 'completed';
      reaction_type:
        | 'fire'
        | 'laugh'
        | 'heart'
        | 'clap'
        | 'mind_blown'
        | 'sad'
        | 'angry'
        | 'star';
      moment_source:
        | 'camera'
        | 'upload'
        | 'screen_record';
      reward_type:
        | 'xp_boost'
        | 'mystery_box'
        | 'badge'
        | 'streak_freeze'
        | 'custom_title';
      offer_type:
        | 'discount'
        | 'free_item'
        | 'experience'
        | 'sponsored_challenge';
      moderation_status:
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'escalated';
      moderation_decision_type:
        | 'approve'
        | 'reject'
        | 'escalate'
        | 'shadow_ban';
      moderation_content_type:
        | 'moment'
        | 'heist_submission'
        | 'poll';
      streak_type:
        | 'daily_login'
        | 'yollr_bell'
        | 'heist_participation';
      campus_role:
        | 'member'
        | 'moderator'
        | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}