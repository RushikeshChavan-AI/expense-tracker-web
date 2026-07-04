import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Wallet,
  Laptop,
  MoreHorizontal,
  Tag,
} from "lucide-react";

const ICON_MAP = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Wallet,
  Laptop,
  MoreHorizontal,
  Tag,
};

export function getCategoryIcon(name) {
  return ICON_MAP[name] || Tag;
}

export const ICON_OPTIONS = Object.keys(ICON_MAP);
