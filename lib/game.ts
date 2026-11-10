import type { Item, Restaurant } from "./data";

export const SLOT_COUNT = 5;

export type Pick = { restaurant: Restaurant; item: Item };

export function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export type Rarity = { label: string; badge: string; color: string };

// Rarity is based on the item's rating. `color` is used for the case-opening card glow.
export function rarityOf(rating: number): Rarity {
  if (rating >= 9) return { label: "Legendary", badge: "badge-warning", color: "#f59e0b" };
  if (rating >= 8) return { label: "Epic", badge: "badge-primary", color: "#dc2626" };
  if (rating >= 7) return { label: "Rare", badge: "badge-secondary", color: "#f97316" };
  if (rating >= 6) return { label: "Common", badge: "badge-success", color: "#22c55e" };
  return { label: "Meh", badge: "badge-ghost", color: "#9ca3af" };
}

export type ScoreBreakdown = {
  base: number; // sum of ratings, scaled to 0-70
  variety: number; // up to +15 for covering different categories
  brandCombo: number; // +5 for each extra item from the same restaurant (up to +15)
  total: number; // capped at 100
  grade: string;
  title: string;
};

export function scoreLineup(picks: Pick[]): ScoreBreakdown {
  const maxRating = 10 * SLOT_COUNT;
  const sum = picks.reduce((s, p) => s + p.item.rating, 0);
  const base = Math.round((sum / maxRating) * 70);

  const categories = new Set(picks.map((p) => p.item.category));
  const variety = Math.min(15, Math.max(0, (categories.size - 1) * 4));

  const counts = new Map<string, number>();
  picks.forEach((p) => counts.set(p.restaurant.name, (counts.get(p.restaurant.name) ?? 0) + 1));
  let brandCombo = 0;
  counts.forEach((n) => (brandCombo += (n - 1) * 5));
  brandCombo = Math.min(15, brandCombo);

  const total = Math.min(100, base + variety + brandCombo);

  const [grade, title] =
    total >= 90 ? ["S", "Fast Food Royalty"]
    : total >= 80 ? ["A", "Drive-Thru Legend"]
    : total >= 70 ? ["B", "Solid Combo"]
    : total >= 55 ? ["C", "Questionable Choices"]
    : ["D", "Rough Lunch"];

  return { base, variety, brandCombo, total, grade, title };
}
