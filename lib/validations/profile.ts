import { z } from "zod";

/**
 * Onboarding form validation schema
 */
export const onboardingSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim(),
  tier: z.enum([".223", ".556", ".762", ".50 Cal"], {
    errorMap: () => ({ message: "Please select a tier" }),
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/**
 * Profile update validation schema
 */
export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim()
    .optional(),
  tier: z
    .enum([".223", ".556", ".762", ".50 Cal"])
    .optional(),
  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters")
    .trim()
    .optional()
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Body metrics validation schema
 */
export const bodyMetricsSchema = z.object({
  weight_lbs: z
    .number({
      required_error: "Weight is required",
      invalid_type_error: "Weight must be a number",
    })
    .min(50, "Weight must be at least 50 lbs")
    .max(500, "Weight cannot exceed 500 lbs")
    .positive("Weight must be positive"),
  body_fat_percentage: z
    .number({
      invalid_type_error: "Body fat percentage must be a number",
    })
    .min(3, "Body fat percentage must be at least 3%")
    .max(60, "Body fat percentage cannot exceed 60%")
    .positive("Body fat percentage must be positive")
    .optional()
    .nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .refine((date) => {
      const d = new Date(date);
      const now = new Date();
      return !isNaN(d.getTime()) && d <= now;
    }, "Date cannot be in the future"),
  notes: z
    .string()
    .max(200, "Notes cannot exceed 200 characters")
    .trim()
    .optional()
    .nullable(),
});

export type BodyMetricsInput = z.infer<typeof bodyMetricsSchema>;
