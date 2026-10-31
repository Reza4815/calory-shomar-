import { RecipeDetailClient } from "@/components/recipes/recipe-detail";
import { RECIPES } from "@/lib/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ id: r.id }));
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) notFound();
  return <RecipeDetailClient recipe={recipe} />;
}
