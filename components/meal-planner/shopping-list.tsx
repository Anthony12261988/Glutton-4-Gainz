"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  generateShoppingList,
  getShoppingLists,
  deleteShoppingList,
} from "@/lib/queries/meal-planner-enhanced";
import { Plus, ShoppingCart, Trash2, Copy, Printer, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  checked?: boolean;
}

interface ShoppingList {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  ingredients: Ingredient[];
  created_at: string;
}

interface ShoppingListGeneratorProps {
  userId: string;
}

const INGREDIENT_CATEGORIES = [
  "Proteins",
  "Vegetables",
  "Fruits",
  "Grains",
  "Dairy",
  "Pantry",
  "Spices",
  "Other",
];

export function ShoppingListGenerator({ userId }: ShoppingListGeneratorProps) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewListId, setViewListId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Generate form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    loadShoppingLists();
  }, [userId]);

  useEffect(() => {
    // Set default dates (this week)
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    setStartDate(weekStart.toISOString().split("T")[0]);
    setEndDate(weekEnd.toISOString().split("T")[0]);
  }, []);

  async function loadShoppingLists() {
    setLoading(true);
    const { data, error } = await getShoppingLists(userId);

    if (error) {
      console.error("Error loading shopping lists:", error);
      toast({
        variant: "destructive",
        title: "Error loading shopping lists",
        description: error.message,
      });
    }

    setLists((data as unknown as ShoppingList[]) || []);
    setLoading(false);
  }

  async function handleGenerateList() {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Dates required",
        description: "Please select start and end dates",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        variant: "destructive",
        title: "Invalid date range",
        description: "Start date must be before end date",
      });
      return;
    }

    setGenerating(true);

    const { data, error } = await generateShoppingList(userId, startDate, endDate);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error generating shopping list",
        description: error.message,
      });
      setGenerating(false);
      return;
    }

    if (!data || (data as any).ingredients.length === 0) {
      toast({
        variant: "destructive",
        title: "No ingredients found",
        description: "No meal plans found in the selected date range",
      });
      setGenerating(false);
      return;
    }

    toast({
      title: "Shopping list created",
      description: "Your shopping list has been generated",
    });

    setCreateDialogOpen(false);
    setGenerating(false);
    await loadShoppingLists();
  }

  async function handleDeleteList(listId: string) {
    const { error } = await deleteShoppingList(listId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting list",
        description: error.message,
      });
      return;
    }

    toast({
      title: "List deleted",
      description: "Shopping list has been removed",
    });

    await loadShoppingLists();
  }

  function handleCopyToClipboard(list: ShoppingList) {
    const groupedIngredients = groupIngredientsByCategory(list.ingredients);

    let text = `Shopping List (${formatDate(list.start_date)} - ${formatDate(list.end_date)})\n\n`;

    Object.entries(groupedIngredients).forEach(([category, ingredients]) => {
      text += `${category}:\n`;
      ingredients.forEach((ing: Ingredient) => {
        const qty = ing.quantity ? `${ing.quantity}${ing.unit || ""}` : "";
        text += `  ${ing.checked ? "✓" : "○"} ${ing.name} ${qty}\n`;
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Shopping list copied to clipboard",
    });
  }

  function handlePrint(list: ShoppingList) {
    const groupedIngredients = groupIngredientsByCategory(list.ingredients);

    let printContent = `
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
            .date { color: #666; margin-bottom: 20px; }
            ul { list-style: none; padding: 0; }
            li { margin: 5px 0; }
            input { margin-right: 10px; }
          </style>
        </head>
        <body>
          <h1>Shopping List</h1>
          <div class="date">${formatDate(list.start_date)} - ${formatDate(list.end_date)}</div>
    `;

    Object.entries(groupedIngredients).forEach(([category, ingredients]) => {
      printContent += `<h2>${category}</h2><ul>`;
      ingredients.forEach((ing: Ingredient) => {
        const qty = ing.quantity ? `${ing.quantity}${ing.unit || ""}` : "";
        printContent += `<li><input type="checkbox" /> ${ing.name} ${qty}</li>`;
      });
      printContent += `</ul>`;
    });

    printContent += `</body></html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  function groupIngredientsByCategory(ingredients: Ingredient[]) {
    const grouped: { [key: string]: Ingredient[] } = {};

    INGREDIENT_CATEGORIES.forEach((cat) => {
      grouped[cat] = [];
    });

    ingredients.forEach((ing) => {
      const category = ing.category || "Other";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(ing);
    });

    // Remove empty categories
    Object.keys(grouped).forEach((key) => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  }

  function toggleIngredientCheck(listId: string, ingredientName: string) {
    const key = `${listId}-${ingredientName}`;
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }

  function isIngredientChecked(listId: string, ingredientName: string): boolean {
    return checkedItems.has(`${listId}-${ingredientName}`);
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const viewList = lists.find((l) => l.id === viewListId);

  if (loading) {
    return (
      <Card className="bg-gunmetal border-steel/20">
        <CardContent className="py-12">
          <div className="text-center text-steel">Loading shopping lists...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gunmetal border-steel/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-high-vis">Shopping Lists</CardTitle>
              <p className="text-sm text-steel mt-1">
                Generate shopping lists from your meal plans
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-radar-green hover:bg-radar-green/80 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate List
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gunmetal border-steel/20">
                <DialogHeader>
                  <DialogTitle className="text-high-vis">Generate Shopping List</DialogTitle>
                  <DialogDescription className="text-steel">
                    Select a date range to generate a shopping list from your meal plans
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date" className="text-steel">
                      Start Date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-gunmetal border-steel/20 text-high-vis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date" className="text-steel">
                      End Date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-gunmetal border-steel/20 text-high-vis"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-steel/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateList}
                    disabled={generating}
                    className="bg-radar-green hover:bg-radar-green/80 text-black"
                  >
                    {generating ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Shopping Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => {
          const itemCount = list.ingredients.length;
          const checkedCount = list.ingredients.filter((ing) =>
            isIngredientChecked(list.id, ing.name)
          ).length;

          return (
            <Card key={list.id} className="bg-gunmetal border-steel/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base text-high-vis">
                      {formatDate(list.start_date)} - {formatDate(list.end_date)}
                    </CardTitle>
                    <p className="text-xs text-steel mt-1">
                      {itemCount} items
                      {checkedCount > 0 && ` • ${checkedCount} checked`}
                    </p>
                  </div>
                  <span className="text-xs border border-radar-green text-radar-green px-2 py-1 rounded flex items-center">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {itemCount}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-steel/20 hover:bg-steel/10"
                        onClick={() => setViewListId(list.id)}
                      >
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gunmetal border-steel/20 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-high-vis">Shopping List</DialogTitle>
                        <DialogDescription className="text-steel">
                          {formatDate(list.start_date)} - {formatDate(list.end_date)}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 mb-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToClipboard(list)}
                            className="border-steel/20"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrint(list)}
                            className="border-steel/20"
                          >
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto">
                        <div className="space-y-4 py-4 pr-2">
                          {Object.entries(groupIngredientsByCategory(list.ingredients)).map(
                            ([category, ingredients]) => (
                              <div key={category}>
                                <h4 className="text-sm font-medium text-high-vis mb-2">
                                  {category}
                                </h4>
                                <div className="space-y-1">
                                  {ingredients.map((ing: Ingredient) => {
                                    const isChecked = isIngredientChecked(list.id, ing.name);
                                    return (
                                      <div
                                        key={ing.name}
                                        onClick={() => toggleIngredientCheck(list.id, ing.name)}
                                        className="flex items-center gap-2 bg-gunmetal-dark p-2 rounded cursor-pointer hover:bg-steel/10 transition-colors"
                                      >
                                        <div
                                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                            isChecked
                                              ? "bg-radar-green border-radar-green"
                                              : "border-steel/40"
                                          }`}
                                        >
                                          {isChecked && <Check className="h-3 w-3 text-black" />}
                                        </div>
                                        <span
                                          className={`text-sm flex-1 ${
                                            isChecked
                                              ? "text-steel line-through"
                                              : "text-high-vis"
                                          }`}
                                        >
                                          {ing.name}
                                        </span>
                                        {ing.quantity && (
                                          <span className="text-xs text-steel">
                                            {ing.quantity}
                                            {ing.unit || ""}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteList(list.id)}
                    className="border-tactical-red/20 text-tactical-red hover:bg-tactical-red/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {lists.length === 0 && (
        <Card className="bg-gunmetal border-steel/20">
          <CardContent className="py-12">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-steel/40 mx-auto mb-4" />
              <p className="text-steel mb-4">No shopping lists yet</p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-radar-green hover:bg-radar-green/80 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Your First List
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
