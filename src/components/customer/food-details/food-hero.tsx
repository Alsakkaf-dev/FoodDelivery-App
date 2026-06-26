import { FoodImage } from '@/components/ui/food-image';
import type { MenuItem } from '@/types/db';

// Food hero — the dish floats on a warm amber→orange gradient panel with a soft contact
// shadow (design spec §7). Image via the shared FoodImage helper (CSS background-image +
// SVG fallback replacing the old 🌯 emoji). No remote next/image config is introduced.
export function FoodHero({ item, alt }: { item: MenuItem; alt: string }) {
  return (
    <div className="bg-hero-gradient flex items-center justify-center rounded-xl p-6 shadow-card">
      <FoodImage src={item.photo_url} alt={alt} shape="hero" className="w-2/3" />
    </div>
  );
}
