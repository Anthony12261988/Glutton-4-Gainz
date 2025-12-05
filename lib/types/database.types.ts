export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      body_metrics: {
        Row: {
          created_at: string;
          id: string;
          recorded_at: string;
          user_id: string;
          weight: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          recorded_at?: string;
          user_id: string;
          weight: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          recorded_at?: string;
          user_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "body_metrics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      buddies: {
        Row: {
          buddy_id: string;
          created_at: string;
          id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          buddy_id: string;
          created_at?: string;
          id?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          buddy_id?: string;
          created_at?: string;
          id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "buddies_buddy_id_fkey";
            columns: ["buddy_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "buddies_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      coach_invites: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          invited_by: string | null;
          status: "accepted" | "pending";
          token: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          invited_by?: string | null;
          status?: "accepted" | "pending";
          token?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          invited_by?: string | null;
          status?: "accepted" | "pending";
          token?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coach_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      meal_plans: {
        Row: {
          assigned_date: string;
          created_at: string;
          id: string;
          recipe_id: string;
          user_id: string;
        };
        Insert: {
          assigned_date: string;
          created_at?: string;
          id?: string;
          recipe_id: string;
          user_id: string;
        };
        Update: {
          assigned_date?: string;
          created_at?: string;
          id?: string;
          recipe_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_plans_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_plans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_read: boolean;
          receiver_id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          receiver_id: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          receiver_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          banned: boolean;
          coach_id: string | null;
          created_at: string;
          current_streak: number;
          email: string;
          id: string;
          last_active: string;
          role: "admin" | "coach" | "soldier" | "user";
          stripe_customer_id: string | null;
          tier: string;
          updated_at: string;
          xp: number;
          // Fitness Dossier fields
          fitness_experience:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "athlete"
            | null;
          fitness_goal:
            | "lose_fat"
            | "build_muscle"
            | "get_stronger"
            | "improve_endurance"
            | "general_fitness"
            | null;
          available_equipment: string[] | null;
          injuries_limitations: string | null;
          preferred_duration: number | null;
          workout_days_per_week: number | null;
          height_inches: number | null;
          target_weight: number | null;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
          dossier_complete: boolean;
        };
        Insert: {
          avatar_url?: string | null;
          banned?: boolean;
          coach_id?: string | null;
          created_at?: string;
          current_streak?: number;
          email: string;
          id: string;
          last_active?: string;
          role?: "admin" | "coach" | "soldier" | "user";
          stripe_customer_id?: string | null;
          tier?: string;
          updated_at?: string;
          xp?: number;
          fitness_experience?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "athlete"
            | null;
          fitness_goal?:
            | "lose_fat"
            | "build_muscle"
            | "get_stronger"
            | "improve_endurance"
            | "general_fitness"
            | null;
          available_equipment?: string[] | null;
          injuries_limitations?: string | null;
          preferred_duration?: number | null;
          workout_days_per_week?: number | null;
          height_inches?: number | null;
          target_weight?: number | null;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
          dossier_complete?: boolean;
        };
        Update: {
          avatar_url?: string | null;
          banned?: boolean;
          coach_id?: string | null;
          created_at?: string;
          current_streak?: number;
          email?: string;
          id?: string;
          last_active?: string;
          role?: "admin" | "coach" | "soldier" | "user";
          stripe_customer_id?: string | null;
          tier?: string;
          updated_at?: string;
          xp?: number;
          fitness_experience?:
            | "beginner"
            | "intermediate"
            | "advanced"
            | "athlete"
            | null;
          fitness_goal?:
            | "lose_fat"
            | "build_muscle"
            | "get_stronger"
            | "improve_endurance"
            | "general_fitness"
            | null;
          available_equipment?: string[] | null;
          injuries_limitations?: string | null;
          preferred_duration?: number | null;
          workout_days_per_week?: number | null;
          height_inches?: number | null;
          target_weight?: number | null;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
          dossier_complete?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      push_subscriptions: {
        Row: {
          auth_key: string;
          created_at: string | null;
          endpoint: string;
          id: string;
          p256dh_key: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          auth_key: string;
          created_at?: string | null;
          endpoint: string;
          id?: string;
          p256dh_key: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          auth_key?: string;
          created_at?: string | null;
          endpoint?: string;
          id?: string;
          p256dh_key?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      recipes: {
        Row: {
          calories: number;
          carbs: number;
          created_at: string;
          fat: number;
          id: string;
          image_url: string | null;
          instructions: string;
          protein: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          calories: number;
          carbs: number;
          created_at?: string;
          fat: number;
          id?: string;
          image_url?: string | null;
          instructions: string;
          protein: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          calories?: number;
          carbs?: number;
          created_at?: string;
          fat?: number;
          id?: string;
          image_url?: string | null;
          instructions?: string;
          protein?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          badge_name: string;
          earned_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          badge_name: string;
          earned_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          badge_name?: string;
          earned_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_logs: {
        Row: {
          created_at: string;
          date: string;
          duration: number;
          id: string;
          notes: string | null;
          user_id: string;
          workout_id: string;
        };
        Insert: {
          created_at?: string;
          date?: string;
          duration: number;
          id?: string;
          notes?: string | null;
          user_id: string;
          workout_id: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          duration?: number;
          id?: string;
          notes?: string | null;
          user_id?: string;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_logs_workout_id_fkey";
            columns: ["workout_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          }
        ];
      };
      workouts: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          scheduled_date: string;
          sets_reps: Json;
          tier: string;
          title: string;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          scheduled_date: string;
          sets_reps?: Json;
          tier: string;
          title: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          scheduled_date?: string;
          sets_reps?: Json;
          tier?: string;
          title?: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      daily_briefings: {
        Row: {
          id: string;
          content: string;
          active: boolean;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          content: string;
          active?: boolean;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          content?: string;
          active?: boolean;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "daily_briefings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_name: string;
          record_type: "weight" | "reps" | "time";
          value: number;
          unit: string;
          notes: string | null;
          achieved_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_name: string;
          record_type: "weight" | "reps" | "time";
          value: number;
          unit: string;
          notes?: string | null;
          achieved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_name?: string;
          record_type?: "weight" | "reps" | "time";
          value?: number;
          unit?: string;
          notes?: string | null;
          achieved_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "personal_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      award_century_badge: { Args: { p_user_id: string }; Returns: undefined };
      award_first_blood_badge: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      award_iron_week_badge: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      calculate_streak: { Args: { p_user_id: string }; Returns: number };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
