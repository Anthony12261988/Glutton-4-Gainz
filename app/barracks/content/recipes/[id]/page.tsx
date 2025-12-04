import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/coach/recipe-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EditRecipePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    redirect("/dashboard");
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!recipe) {
    redirect("/barracks/content/recipes");
  }

  return (
    <div className="min-h-screen bg-camo-black pb-24 text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link
          href="/barracks/content/recipes"
          className="flex items-center text-steel hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mess Hall
        </Link>

        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis mb-8">
          Edit Recipe
        </h1>

        <RecipeForm initialData={recipe} isEditing={true} />
      </div>
    </div>
  );
}
