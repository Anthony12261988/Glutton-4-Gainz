import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, ArrowLeft, ChefHat } from "lucide-react";
import Image from "next/image";
import { DeleteButton } from "@/components/coach/delete-button";

export default async function RecipeManagerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify Coach or Admin Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoachOrAdmin = profile?.role === "coach" || profile?.role === "admin";
  if (!isCoachOrAdmin) redirect("/dashboard");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen pb-20 md:pb-8 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/barracks"
              className="flex items-center text-steel hover:text-white mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Barracks
            </Link>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
              Mess Hall Management
            </h1>
            <p className="text-steel">Manage recipes and rations</p>
          </div>
          <Link
            href="/barracks/content/recipes/new"
            className="w-full sm:w-auto"
          >
            <Button className="bg-tactical-red hover:bg-red-700 w-full sm:w-auto min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" /> New Recipe
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {recipes?.map((recipe) => (
            <Card
              key={recipe.id}
              className="border-steel/20 bg-gunmetal overflow-hidden"
            >
              <div className="relative h-48 w-full">
                {recipe.image_url ? (
                  <Image
                    src={recipe.image_url}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-black/40 text-steel">
                    No Image
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white truncate">
                  {recipe.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-steel mb-4">
                  <span>{recipe.calories} kcal</span>
                  <span>P: {recipe.protein}g</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/barracks/content/recipes/${recipe.id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-steel/30 hover:bg-steel/20 text-white min-h-[44px]"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <DeleteButton
                    id={recipe.id}
                    table="recipes"
                    title={recipe.title}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {recipes?.length === 0 && (
            <div className="col-span-full">
              <div className="rounded-sm border-2 border-dashed border-tactical-red/50 bg-gunmetal/50 p-8 text-center">
                <ChefHat className="mx-auto h-16 w-16 text-tactical-red/50 mb-4" />
                <h3 className="font-heading text-xl text-high-vis mb-2">
                  MESS HALL EMPTY
                </h3>
                <p className="text-muted-text mb-4 max-w-md mx-auto">
                  No recipes have been created yet. Create your first recipe so
                  soldiers can plan their rations.
                </p>
                <Link href="/barracks/content/recipes/new">
                  <Button className="bg-tactical-red hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" /> Create First Recipe
                  </Button>
                </Link>
                <div className="mt-6 p-4 bg-black/30 rounded-sm border border-steel/20 text-left max-w-md mx-auto">
                  <p className="text-xs text-steel font-bold uppercase mb-2">
                    💡 Quick Tip
                  </p>
                  <p className="text-xs text-muted-text">
                    Recipes you create here will appear in the Rations section
                    for all premium users to add to their meal plans.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
