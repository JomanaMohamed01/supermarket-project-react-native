import type { Category, Product } from "@/lib/types";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-meat", name: "Meat", slug: "meat", image_url: null, sort_order: 1 },
  { id: "cat-chicken", name: "Chicken", slug: "chicken", image_url: null, sort_order: 2 },
  { id: "cat-fish", name: "Fish", slug: "fish", image_url: null, sort_order: 3 },
  { id: "cat-dairy", name: "Dairy", slug: "dairy", image_url: null, sort_order: 4 },
  { id: "cat-vegetables", name: "Vegetables", slug: "vegetables", image_url: null, sort_order: 5 },
  { id: "cat-fruits", name: "Fruits", slug: "fruits", image_url: null, sort_order: 6 },
  { id: "cat-pastas", name: "Pastas", slug: "pastas", image_url: null, sort_order: 7 },
  { id: "cat-legumes", name: "Legumes", slug: "legumes", image_url: null, sort_order: 8 },
  { id: "cat-canned", name: "Canned Food", slug: "canned-food", image_url: null, sort_order: 9 },
  { id: "cat-pet", name: "Pet Foods", slug: "pet-foods", image_url: null, sort_order: 10 },
];

export const MOCK_PRODUCTS: Product[] = [
  // Meat
  { id: "p-beef-sausages", category_id: "cat-meat", name: "Beef Sausages", description: "Fresh beef sausages, pack of 6.", price: 8.99, image_url: null, unit: "pack", is_available: true },
  { id: "p-beef-steak", category_id: "cat-meat", name: "Beef Steak", description: "Premium cut, ready to grill.", price: 14.5, image_url: null, unit: "kg", is_available: true },
  { id: "p-lamb-chops", category_id: "cat-meat", name: "Lamb Chops", description: "Tender lamb chops.", price: 16.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-minced-beef", category_id: "cat-meat", name: "Minced Beef", description: "Lean minced beef.", price: 7.49, image_url: null, unit: "kg", is_available: true },
  // Chicken
  { id: "p-chicken-breast", category_id: "cat-chicken", name: "Chicken Breast", description: "Skinless chicken breast fillets.", price: 9.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-chicken-thighs", category_id: "cat-chicken", name: "Chicken Thighs", description: "Juicy bone-in thighs.", price: 6.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-chicken-wings", category_id: "cat-chicken", name: "Chicken Wings", description: "Party-ready chicken wings.", price: 5.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-whole-chicken", category_id: "cat-chicken", name: "Whole Chicken", description: "Fresh whole chicken.", price: 11.5, image_url: null, unit: "each", is_available: true },
  // Fish
  { id: "p-cod", category_id: "cat-fish", name: "Cod Fillet", description: "Mild white fish fillets.", price: 12.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-salmon", category_id: "cat-fish", name: "Salmon Fillet", description: "Rich Atlantic salmon.", price: 18.5, image_url: null, unit: "kg", is_available: true },
  { id: "p-shrimp", category_id: "cat-fish", name: "Shrimp", description: "Peeled and cleaned shrimp.", price: 15.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-tuna-steak", category_id: "cat-fish", name: "Tuna Steak", description: "Thick tuna steaks.", price: 17.25, image_url: null, unit: "kg", is_available: true },
  // Dairy
  { id: "p-butter", category_id: "cat-dairy", name: "Butter", description: "Creamy salted butter.", price: 3.49, image_url: null, unit: "pack", is_available: true },
  { id: "p-cheddar", category_id: "cat-dairy", name: "Cheddar Cheese", description: "Aged cheddar block.", price: 4.99, image_url: null, unit: "pack", is_available: true },
  { id: "p-eggs", category_id: "cat-dairy", name: "Eggs 12", description: "Farm-fresh eggs, dozen.", price: 3.99, image_url: null, unit: "carton", is_available: true },
  { id: "p-milk", category_id: "cat-dairy", name: "Milk 1L", description: "Fresh whole milk.", price: 2.49, image_url: null, unit: "bottle", is_available: true },
  { id: "p-yogurt", category_id: "cat-dairy", name: "Yogurt", description: "Creamy plain yogurt.", price: 2.99, image_url: null, unit: "tub", is_available: true },
  // Vegetables
  { id: "p-cucumbers", category_id: "cat-vegetables", name: "Cucumbers", description: "Crisp cucumbers.", price: 1.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-lettuce", category_id: "cat-vegetables", name: "Lettuce", description: "Fresh green lettuce.", price: 1.79, image_url: null, unit: "head", is_available: true },
  { id: "p-onions", category_id: "cat-vegetables", name: "Onions", description: "Yellow cooking onions.", price: 1.29, image_url: null, unit: "kg", is_available: true },
  { id: "p-potatoes", category_id: "cat-vegetables", name: "Potatoes", description: "All-purpose potatoes.", price: 2.19, image_url: null, unit: "kg", is_available: true },
  { id: "p-tomatoes", category_id: "cat-vegetables", name: "Tomatoes", description: "Ripe salad tomatoes.", price: 2.59, image_url: null, unit: "kg", is_available: true },
  // Fruits
  { id: "p-apples", category_id: "cat-fruits", name: "Apples", description: "Crisp red apples.", price: 2.99, image_url: null, unit: "kg", is_available: true },
  { id: "p-bananas", category_id: "cat-fruits", name: "Bananas", description: "Sweet ripe bananas.", price: 1.49, image_url: null, unit: "kg", is_available: true },
  { id: "p-grapes", category_id: "cat-fruits", name: "Grapes", description: "Seedless grapes.", price: 4.49, image_url: null, unit: "kg", is_available: true },
  { id: "p-oranges", category_id: "cat-fruits", name: "Oranges", description: "Juicy oranges.", price: 2.79, image_url: null, unit: "kg", is_available: true },
  { id: "p-strawberries", category_id: "cat-fruits", name: "Strawberries", description: "Sweet strawberries.", price: 3.99, image_url: null, unit: "pack", is_available: true },
  // Pastas
  { id: "p-fusilli", category_id: "cat-pastas", name: "Fusilli", description: "Spiral pasta.", price: 1.89, image_url: null, unit: "pack", is_available: true },
  { id: "p-macaroni", category_id: "cat-pastas", name: "Macaroni", description: "Classic elbow macaroni.", price: 1.79, image_url: null, unit: "pack", is_available: true },
  { id: "p-penne", category_id: "cat-pastas", name: "Penne", description: "Tube pasta for sauces.", price: 1.89, image_url: null, unit: "pack", is_available: true },
  { id: "p-spaghetti", category_id: "cat-pastas", name: "Spaghetti", description: "Long spaghetti strands.", price: 1.69, image_url: null, unit: "pack", is_available: true },
  // Legumes
  { id: "p-black-beans", category_id: "cat-legumes", name: "Black Beans", description: "Dried black beans.", price: 2.29, image_url: null, unit: "pack", is_available: true },
  { id: "p-chickpeas", category_id: "cat-legumes", name: "Chickpeas", description: "Dried chickpeas.", price: 2.39, image_url: null, unit: "pack", is_available: true },
  { id: "p-lentils", category_id: "cat-legumes", name: "Lentils", description: "Red lentils.", price: 2.19, image_url: null, unit: "pack", is_available: true },
  { id: "p-white-beans", category_id: "cat-legumes", name: "White Beans", description: "Dried white beans.", price: 2.29, image_url: null, unit: "pack", is_available: true },
  // Canned
  { id: "p-canned-beans", category_id: "cat-canned", name: "Canned Beans", description: "Ready-to-eat beans.", price: 1.59, image_url: null, unit: "can", is_available: true },
  { id: "p-canned-corn", category_id: "cat-canned", name: "Canned Corn", description: "Sweet corn kernels.", price: 1.49, image_url: null, unit: "can", is_available: true },
  { id: "p-canned-tuna", category_id: "cat-canned", name: "Canned Tuna", description: "Tuna in water.", price: 2.29, image_url: null, unit: "can", is_available: true },
  { id: "p-tomato-paste", category_id: "cat-canned", name: "Tomato Paste", description: "Rich tomato paste.", price: 1.39, image_url: null, unit: "can", is_available: true },
  // Pet
  { id: "p-cat-wet", category_id: "cat-pet", name: "Cat Wet Food", description: "Savory wet cat food.", price: 1.99, image_url: null, unit: "can", is_available: true },
  { id: "p-dog-treats", category_id: "cat-pet", name: "Dog Treats", description: "Crunchy dog treats.", price: 4.49, image_url: null, unit: "pack", is_available: true },
  { id: "p-cat-dry", category_id: "cat-pet", name: "Dry Cat Food", description: "Balanced dry cat food.", price: 8.99, image_url: null, unit: "bag", is_available: true },
  { id: "p-dog-dry", category_id: "cat-pet", name: "Dry Dog Food", description: "Complete dry dog food.", price: 12.99, image_url: null, unit: "bag", is_available: true },
];
