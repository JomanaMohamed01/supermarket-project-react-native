import type { ImageSourcePropType } from "react-native";

function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const imagesByName: Record<string, ImageSourcePropType> = {
  "beef sausages": require("../../assets/images/products/meat/beef-sausages-2.jpg"),
  "beef steak": require("../../assets/images/products/meat/beef-steak.jpg"),
  "lamb chops": require("../../assets/images/products/meat/lamb-chops.jpg"),
  "minced beef": require("../../assets/images/products/meat/minced-beef.jpg"),
  "chicken breast": require("../../assets/images/products/chicken/chicken-breast.jpg"),
  "chicken thighs": require("../../assets/images/products/chicken/chicken-thighs.jpg"),
  "chicken wings": require("../../assets/images/products/chicken/chicken-wings-2.jpg"),
  "whole chicken": require("../../assets/images/products/chicken/whole-chicken.jpg"),
  "cod fillet": require("../../assets/images/products/fish/cod-fillet.jpg"),
  "salmon fillet": require("../../assets/images/products/fish/salmon-fillet.jpg"),
  shrimp: require("../../assets/images/products/fish/shrimp.jpg"),
  "tuna steak": require("../../assets/images/products/fish/tuna-steak.jpg"),
  "canned beans": require("../../assets/images/products/canned-food/beans.jpg"),
  "canned corn": require("../../assets/images/products/canned-food/corn-2.jpg"),
  "canned tuna": require("../../assets/images/products/canned-food/tuna.jpg"),
  "tomato paste": require("../../assets/images/products/canned-food/tomato-paste.jpg"),
  "cat wet food": require("../../assets/images/products/pet-foods/cat-wet-food.jpg"),
  "dog treats": require("../../assets/images/products/pet-foods/dog-treats.jpg"),
  "dry cat food": require("../../assets/images/products/pet-foods/cat-dry-food.jpg"),
  "dry dog food": require("../../assets/images/products/pet-foods/dog-dry-food.jpg"),
  cucumbers: require("../../assets/images/products/vegetables/cucumbers.jpg"),
  lettuce: require("../../assets/images/products/vegetables/lettuce.jpg"),
  onions: require("../../assets/images/products/vegetables/onion.jpg"),
  potatoes: require("../../assets/images/products/vegetables/potato.jpg"),
  tomatoes: require("../../assets/images/products/vegetables/tomato.jpg"),
  apples: require("../../assets/images/products/fruits/apple.jpg"),
  bananas: require("../../assets/images/products/fruits/banana.jpg"),
  grapes: require("../../assets/images/products/fruits/grapes.jpg"),
  oranges: require("../../assets/images/products/fruits/oranges.jpg"),
  strawberries: require("../../assets/images/products/fruits/strawberry.jpg"),
  "black beans": require("../../assets/images/products/legumes/black-beans.jpg"),
  chickpeas: require("../../assets/images/products/legumes/chickpeas.jpg"),
  lentils: require("../../assets/images/products/legumes/lentils.jpg"),
  "white beans": require("../../assets/images/products/legumes/white-beans.jpg"),
  fusilli: require("../../assets/images/products/pastas/fusilli.jpg"),
  macaroni: require("../../assets/images/products/pastas/macaroni.jpg"),
  penne: require("../../assets/images/products/pastas/penne.jpg"),
  spaghetti: require("../../assets/images/products/pastas/spaghetti.jpg"),
  butter: require("../../assets/images/products/dairy/butter.jpg"),
  "cheddar cheese": require("../../assets/images/products/dairy/cheddar.jpg"),
  "eggs 12": require("../../assets/images/products/dairy/eggs.jpg"),
  "milk 1l": require("../../assets/images/products/dairy/milk.jpg"),
  yogurt: require("../../assets/images/products/dairy/yogurt.jpg"),
};

export function productImageSource(
  name: string,
  imageUrl?: string | null,
): ImageSourcePropType | { uri: string } | null {
  const stored = imageUrl?.trim();
  if (stored) {
    if (stored.startsWith("http://") || stored.startsWith("https://") || stored.startsWith("file://")) {
      return { uri: stored };
    }
  }
  return imagesByName[normalizeName(name)] ?? null;
}
