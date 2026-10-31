import { Cookie, Drumstick, Leaf, Salad, Soup, UtensilsCrossed } from "lucide-react";
import type { FoodItem } from "@/lib/types";

export function foodIcon(tag: FoodItem["tag"], size = 20) {
  const cls = { className: "", style: { width: size, height: size } };
  switch (tag) {
    case "protein":
      return <Drumstick {...cls} />;
    case "green":
      return <Leaf {...cls} />;
    case "soup":
      return <Soup {...cls} />;
    case "sweet":
      return <Cookie {...cls} />;
    case "light":
      return <Salad {...cls} />;
    default:
      return <UtensilsCrossed {...cls} />;
  }
}
