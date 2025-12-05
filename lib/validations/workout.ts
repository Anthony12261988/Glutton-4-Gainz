import { z } from "zod";

/**
 * Complete mission form validation schema
 */
export const completeMissionSchema = z.object({
  duration: z
    .number({ message: "Duration must be a valid number" })
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 10 hours (600 minutes)")
    .int("Duration must be a whole number"),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable(),
});

export type CompleteMissionInput = z.infer<typeof completeMissionSchema>;

/**
 * Create workout schema (for admins/coaches)
 */
export const createWorkoutSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description is too long")
    .trim(),
  tier: z.enum([".223", ".556", ".762", ".50 Cal"], {
    message: "Invalid tier selected",
  }),
  video_url: z
    .string()
    .url("Invalid video URL")
    .regex(
      /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//,
      "Must be a YouTube URL"
    )
    .optional()
    .nullable(),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }, "Invalid date"),
  sets_reps: z
    .array(
      z.object({
        exercise: z.string().min(1, "Exercise name is required").trim(),
        reps: z.string().min(1, "Reps/duration is required").trim(),
      })
    )
    .min(1, "At least one exercise is required")
    .max(20, "Maximum 20 exercises allowed"),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
