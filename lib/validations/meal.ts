import { z } from "zod";

/**
 * Recipe creation/update validation schema
 */
export const recipeSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description is too long")
    .trim()
    .optional()
    .nullable(),
  protein_g: z
    .number({
      required_error: "Protein is required",
      invalid_type_error: "Protein must be a number",
    })
    .min(0, "Protein cannot be negative")
    .max(500, "Protein value is too high"),
  carbs_g: z
    .number({
      required_error: "Carbs are required",
      invalid_type_error: "Carbs must be a number",
    })
    .min(0, "Carbs cannot be negative")
    .max(500, "Carbs value is too high"),
  fat_g: z
    .number({
      required_error: "Fat is required",
      invalid_type_error: "Fat must be a number",
    })
    .min(0, "Fat cannot be negative")
    .max(200, "Fat value is too high"),
  calories: z
    .number({
      required_error: "Calories are required",
      invalid_type_error: "Calories must be a number",
    })
    .min(0, "Calories cannot be negative")
    .max(5000, "Calories value is too high"),
  ingredients: z
    .array(z.string().min(1, "Ingredient cannot be empty"))
    .min(1, "At least one ingredient is required")
    .max(30, "Maximum 30 ingredients allowed"),
  instructions: z
    .array(z.string().min(1, "Instruction cannot be empty"))
    .min(1, "At least one instruction is required")
    .max(20, "Maximum 20 instructions allowed"),
  prep_time_minutes: z
    .number({
      invalid_type_error: "Prep time must be a number",
    })
    .min(1, "Prep time must be at least 1 minute")
    .max(480, "Prep time cannot exceed 8 hours")
    .optional()
    .nullable(),
  servings: z
    .number({
      invalid_type_error: "Servings must be a number",
    })
    .min(1, "At least 1 serving required")
    .max(20, "Maximum 20 servings")
    .optional()
    .nullable(),
});

export type RecipeInput = z.infer<typeof recipeSchema>;

/**
 * Meal plan assignment validation schema
 */
export const assignMealSchema = z.object({
  recipe_id: z
    .string()
    .uuid("Invalid recipe ID")
    .min(1, "Recipe is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }, "Invalid date"),
  meal_time: z.enum(["breakfast", "lunch", "dinner", "snack"], {
    errorMap: () => ({ message: "Invalid meal time" }),
  }),
});

export type AssignMealInput = z.infer<typeof assignMealSchema>;
