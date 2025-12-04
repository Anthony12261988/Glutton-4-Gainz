/**
 * This file will be auto-generated from Supabase schema using:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
 *
 * For now, we define the basic structure manually.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'user' | 'coach'
          tier: string
          xp: number
          current_streak: number
          coach_id: string | null
          last_active: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'coach'
          tier?: string
          xp?: number
          current_streak?: number
          coach_id?: string | null
          last_active?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'user' | 'coach'
          tier?: string
          xp?: number
          current_streak?: number
          coach_id?: string | null
          last_active?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      body_metrics: {
        Row: {
          id: string
          user_id: string
          weight: number
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          recorded_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          recorded_at?: string
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          tier: string
          title: string
          description: string
          video_url: string
          scheduled_date: string
          sets_reps: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tier: string
          title: string
          description: string
          video_url: string
          scheduled_date: string
          sets_reps: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tier?: string
          title?: string
          description?: string
          video_url?: string
          scheduled_date?: string
          sets_reps?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_logs: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          date: string
          duration: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          date: string
          duration: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          date?: string
          duration?: number
          notes?: string | null
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_name: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_name: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_name?: string
          earned_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          image_url: string | null
          calories: number
          protein: number
          carbs: number
          fat: number
          instructions: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url?: string | null
          calories: number
          protein: number
          carbs: number
          fat: number
          instructions: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string | null
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          instructions?: string
          created_at?: string
          updated_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          assigned_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          assigned_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          assigned_date?: string
          created_at?: string
        }
      }
      buddies: {
        Row: {
          id: string
          user_id: string
          buddy_id: string
          status: 'pending' | 'accepted'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          buddy_id: string
          status?: 'pending' | 'accepted'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          buddy_id?: string
          status?: 'pending' | 'accepted'
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
