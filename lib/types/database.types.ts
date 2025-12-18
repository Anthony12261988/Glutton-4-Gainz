export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      body_metrics: {
        Row: {
          created_at: string
          id: string
          recorded_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          recorded_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          id?: string
          recorded_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "body_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buddies: {
        Row: {
          buddy_id: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          buddy_id: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          buddy_id?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buddies_buddy_id_fkey"
            columns: ["buddy_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buddies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
          status: string | null
          token: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          status?: string | null
          token?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          status?: string | null
          token?: string | null
        }
        Relationships: []
      }
      daily_briefings: {
        Row: {
          active: boolean | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
        }
        Relationships: []
      }
      featured_meals: {
        Row: {
          created_at: string
          created_by: string | null
          featured_date: string
          id: string
          recipe_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          featured_date: string
          id?: string
          recipe_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          featured_date?: string
          id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_meals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          assigned_date: string
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          assigned_date: string
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          assigned_date?: string
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string | null
          exercise_name: string
          id: string
          notes: string | null
          record_type: string
          unit: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          achieved_at?: string
          created_at?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          record_type: string
          unit: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          achieved_at?: string
          created_at?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          record_type?: string
          unit?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          available_equipment: string[] | null
          avatar_url: string | null
          banned: boolean
          coach_id: string | null
          created_at: string
          current_streak: number
          date_of_birth: string | null
          dossier_complete: boolean | null
          email: string
          fitness_experience: string | null
          fitness_goal: string | null
          gender: string | null
          height_inches: number | null
          id: string
          injuries_limitations: string | null
          intro_video_watched: boolean | null
          last_active: string
          onboarding_completed: boolean | null
          preferred_duration: number | null
          role: string
          stripe_customer_id: string | null
          target_weight: number | null
          tier: string
          updated_at: string
          workout_days_per_week: number | null
          xp: number
        }
        Insert: {
          available_equipment?: string[] | null
          avatar_url?: string | null
          banned?: boolean
          coach_id?: string | null
          created_at?: string
          current_streak?: number
          date_of_birth?: string | null
          dossier_complete?: boolean | null
          email: string
          fitness_experience?: string | null
          fitness_goal?: string | null
          gender?: string | null
          height_inches?: number | null
          id: string
          injuries_limitations?: string | null
          intro_video_watched?: boolean | null
          last_active?: string
          onboarding_completed?: boolean | null
          preferred_duration?: number | null
          role?: string
          stripe_customer_id?: string | null
          target_weight?: number | null
          tier?: string
          updated_at?: string
          workout_days_per_week?: number | null
          xp?: number
        }
        Update: {
          available_equipment?: string[] | null
          avatar_url?: string | null
          banned?: boolean
          coach_id?: string | null
          created_at?: string
          current_streak?: number
          date_of_birth?: string | null
          dossier_complete?: boolean | null
          email?: string
          fitness_experience?: string | null
          fitness_goal?: string | null
          gender?: string | null
          height_inches?: number | null
          id?: string
          injuries_limitations?: string | null
          intro_video_watched?: boolean | null
          last_active?: string
          onboarding_completed?: boolean | null
          preferred_duration?: number | null
          role?: string
          stripe_customer_id?: string | null
          target_weight?: number | null
          tier?: string
          updated_at?: string
          workout_days_per_week?: number | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          image_url: string | null
          instructions: string
          is_standard_issue: boolean
          protein: number
          title: string
          updated_at: string
        }
        Insert: {
          calories: number
          carbs: number
          created_at?: string
          fat: number
          id?: string
          image_url?: string | null
          instructions: string
          is_standard_issue?: boolean
          protein: number
          title: string
          updated_at?: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          image_url?: string | null
          instructions?: string
          is_standard_issue?: boolean
          protein?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_logs: {
        Row: {
          created_at: string
          date: string
          duration: number
          id: string
          notes: string | null
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          duration: number
          id?: string
          notes?: string | null
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: number
          id?: string
          notes?: string | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          scheduled_date: string
          sets_reps: Json
          tier: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          scheduled_date: string
          sets_reps?: Json
          tier: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          scheduled_date?: string
          sets_reps?: Json
          tier?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      zero_day_tests: {
        Row: {
          assigned_tier: string
          completed_at: string
          created_at: string
          id: string
          plank_seconds: number
          previous_tier: string | null
          pushups: number
          squats: number
          user_id: string
        }
        Insert: {
          assigned_tier: string
          completed_at?: string
          created_at?: string
          id?: string
          plank_seconds: number
          previous_tier?: string | null
          pushups: number
          squats: number
          user_id: string
        }
        Update: {
          assigned_tier?: string
          completed_at?: string
          created_at?: string
          id?: string
          plank_seconds?: number
          previous_tier?: string | null
          pushups?: number
          squats?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zero_day_tests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_century_badge: { Args: { p_user_id: string }; Returns: undefined }
      award_first_blood_badge: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      award_iron_week_badge: { Args: { p_user_id: string }; Returns: undefined }
      calculate_streak: { Args: { p_user_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
