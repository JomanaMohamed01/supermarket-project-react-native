import {
  Apple,
  Bean,
  Beef,
  Carrot,
  Drumstick,
  Fish,
  Milk,
  Package,
  PawPrint,
  ShoppingBasket,
  Wheat,
  type LucideIcon,
} from "lucide-react-native";
import { colors } from "@/constants/theme";

type CategoryIconProps = {
  name: string;
  slug?: string | null;
  size?: number;
  color?: string;
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const icons: Record<string, LucideIcon> = {
  meat: Beef,
  chicken: Drumstick,
  fish: Fish,
  "canned-food": Package,
  "pet-food": PawPrint,
  "pet-foods": PawPrint,
  vegetables: Carrot,
  fruits: Apple,
  legumes: Bean,
  pastas: Wheat,
  pasta: Wheat,
  dairy: Milk,
};

export function CategoryIcon({
  name,
  slug,
  size = 28,
  color = colors.leaf,
}: CategoryIconProps) {
  const key = normalizeKey(slug || name);
  const Icon = icons[key] ?? ShoppingBasket;
  return <Icon size={size} color={color} strokeWidth={2} />;
}
