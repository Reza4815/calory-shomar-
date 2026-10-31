import { Carrot, CookingPot, Egg, Salad, Soup, UtensilsCrossed } from "lucide-react";
import type { Recipe } from "@/lib/types";

const TONE_BG: Record<Recipe["tone"], string> = {
  green: "linear-gradient(140deg, rgba(32,201,138,0.22), rgba(32,201,138,0.06))",
  blue: "linear-gradient(140deg, rgba(85,153,242,0.22), rgba(85,153,242,0.06))",
  purple: "linear-gradient(140deg, rgba(155,120,232,0.24), rgba(155,120,232,0.06))",
  orange: "linear-gradient(140deg, rgba(242,169,75,0.22), rgba(242,169,75,0.06))",
  red: "linear-gradient(140deg, rgba(241,107,104,0.24), rgba(241,107,104,0.06))",
};

const TONE_FG: Record<Recipe["tone"], string> = {
  green: "#20C98A",
  blue: "#5599F2",
  purple: "#9B78E8",
  orange: "#F2A94B",
  red: "#F16B68",
};

const TONE_ICON: Record<Recipe["tone"], typeof Soup> = {
  green: Salad,
  blue: Egg,
  purple: Carrot,
  orange: Soup,
  red: CookingPot,
};

export function RecipeIcon({
  tone,
  size = 76,
  iconSize = 30,
}: {
  tone: Recipe["tone"];
  size?: number;
  iconSize?: number;
}) {
  const Icon = TONE_ICON[tone] ?? UtensilsCrossed;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[20px] border border-white/5"
      style={{ width: size, height: size, background: TONE_BG[tone], color: TONE_FG[tone] }}
    >
      <Icon style={{ width: iconSize, height: iconSize }} strokeWidth={1.7} />
    </span>
  );
}
