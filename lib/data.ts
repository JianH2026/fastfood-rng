// Fast food data. Ratings (1-10) are just fun opinions -- change them however you like!

export type Category = "Burger" | "Chicken" | "Side" | "Drink" | "Dessert" | "Breakfast" | "Other";

export type Item = { name: string; rating: number; category: Category };

export const categoryEmoji: Record<Category, string> = {
  Burger: "🍔",
  Chicken: "🍗",
  Side: "🍟",
  Drink: "🥤",
  Dessert: "🍦",
  Breakfast: "🥞",
  Other: "🌮",
};

// "McDonald's" + "Big Mac" -> "/food/mcdonalds-big-mac.jpg"
// Drop a photo with that name into the /public/food folder and it shows up automatically.
export function imagePath(restaurant: string, item: string): string {
  const slug = `${restaurant}-${item}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `/food/${slug}.jpg`;
}

export type Restaurant = { name: string; emoji: string; items: Item[] };

export const restaurants: Restaurant[] = [
  {
    name: "McDonald's",
    emoji: "🍟",
    items: [
      { name: "Big Mac", rating: 7, category: "Burger" },
      { name: "McChicken", rating: 6, category: "Chicken" },
      { name: "Chicken McNuggets", rating: 8, category: "Chicken" },
      { name: "World Famous Fries", rating: 9, category: "Side" },
      { name: "McFlurry", rating: 7, category: "Dessert" },
      { name: "Sausage McMuffin", rating: 7, category: "Breakfast" },
    ],
  },
  {
    name: "Burger King",
    emoji: "👑",
    items: [
      { name: "Whopper", rating: 8, category: "Burger" },
      { name: "Chicken Fries", rating: 7, category: "Chicken" },
      { name: "Onion Rings", rating: 8, category: "Side" },
      { name: "Hershey's Pie", rating: 6, category: "Dessert" },
      { name: "Croissan'wich", rating: 6, category: "Breakfast" },
      { name: "Coke Freestyle", rating: 6, category: "Drink" },
    ],
  },
  {
    name: "Wendy's",
    emoji: "🧑‍🦰",
    items: [
      { name: "Dave's Double", rating: 8, category: "Burger" },
      { name: "Spicy Chicken Sandwich", rating: 8, category: "Chicken" },
      { name: "Baconator Fries", rating: 7, category: "Side" },
      { name: "Frosty", rating: 9, category: "Dessert" },
      { name: "Baked Potato", rating: 6, category: "Side" },
      { name: "Chili", rating: 6, category: "Other" },
    ],
  },
  {
    name: "Chick-fil-A",
    emoji: "🐔",
    items: [
      { name: "Original Chicken Sandwich", rating: 9, category: "Chicken" },
      { name: "Spicy Deluxe", rating: 8, category: "Chicken" },
      { name: "Waffle Fries", rating: 9, category: "Side" },
      { name: "Chick-fil-A Nuggets", rating: 9, category: "Chicken" },
      { name: "Frosted Lemonade", rating: 8, category: "Drink" },
      { name: "Chicken Biscuit", rating: 8, category: "Breakfast" },
    ],
  },
  {
    name: "Taco Bell",
    emoji: "🔔",
    items: [
      { name: "Crunchwrap Supreme", rating: 9, category: "Other" },
      { name: "Doritos Locos Taco", rating: 8, category: "Other" },
      { name: "Chalupa", rating: 7, category: "Other" },
      { name: "Nachos BellGrande", rating: 7, category: "Side" },
      { name: "Cinnabon Delights", rating: 7, category: "Dessert" },
      { name: "Baja Blast", rating: 9, category: "Drink" },
    ],
  },
  {
    name: "KFC",
    emoji: "🍗",
    items: [
      { name: "Original Recipe Chicken", rating: 8, category: "Chicken" },
      { name: "Extra Crispy Tenders", rating: 8, category: "Chicken" },
      { name: "Mashed Potatoes & Gravy", rating: 8, category: "Side" },
      { name: "Biscuit", rating: 7, category: "Side" },
      { name: "Famous Bowl", rating: 7, category: "Other" },
      { name: "Chocolate Chip Cookie", rating: 5, category: "Dessert" },
    ],
  },
  {
    name: "Subway",
    emoji: "🥖",
    items: [
      { name: "Italian B.M.T.", rating: 6, category: "Other" },
      { name: "Meatball Marinara", rating: 6, category: "Other" },
      { name: "Turkey Breast", rating: 5, category: "Other" },
      { name: "Footlong Cookie", rating: 7, category: "Dessert" },
      { name: "Chips", rating: 4, category: "Side" },
      { name: "Fountain Soda", rating: 5, category: "Drink" },
    ],
  },
  {
    name: "Popeyes",
    emoji: "🌶️",
    items: [
      { name: "Chicken Sandwich", rating: 9, category: "Chicken" },
      { name: "Spicy Chicken Tenders", rating: 8, category: "Chicken" },
      { name: "Cajun Fries", rating: 8, category: "Side" },
      { name: "Red Beans & Rice", rating: 8, category: "Side" },
      { name: "Buttermilk Biscuit", rating: 9, category: "Side" },
      { name: "Apple Pie", rating: 6, category: "Dessert" },
    ],
  },
  {
    name: "In-N-Out",
    emoji: "🌴",
    items: [
      { name: "Double-Double", rating: 9, category: "Burger" },
      { name: "Animal Style Fries", rating: 9, category: "Side" },
      { name: "Cheeseburger", rating: 8, category: "Burger" },
      { name: "Neapolitan Shake", rating: 8, category: "Dessert" },
      { name: "Hamburger", rating: 7, category: "Burger" },
      { name: "Lemonade", rating: 6, category: "Drink" },
    ],
  },
  {
    name: "Five Guys",
    emoji: "🥔",
    items: [
      { name: "Bacon Cheeseburger", rating: 9, category: "Burger" },
      { name: "Cajun Fries", rating: 8, category: "Side" },
      { name: "Hot Dog", rating: 6, category: "Other" },
      { name: "Milkshake", rating: 8, category: "Dessert" },
      { name: "Little Hamburger", rating: 7, category: "Burger" },
      { name: "Grilled Cheese", rating: 5, category: "Other" },
    ],
  },
  {
    name: "Starbucks",
    emoji: "☕",
    items: [
      { name: "Pink Drink", rating: 7, category: "Drink" },
      { name: "Caramel Frappuccino", rating: 8, category: "Drink" },
      { name: "Iced Latte", rating: 7, category: "Drink" },
      { name: "Bacon Gouda Sandwich", rating: 7, category: "Breakfast" },
      { name: "Cake Pop", rating: 6, category: "Dessert" },
      { name: "Lemon Loaf", rating: 7, category: "Dessert" },
    ],
  },
  {
    name: "Dunkin'",
    emoji: "🍩",
    items: [
      { name: "Iced Coffee", rating: 7, category: "Drink" },
      { name: "Glazed Donut", rating: 7, category: "Dessert" },
      { name: "Hash Browns", rating: 8, category: "Side" },
      { name: "Wake-Up Wrap", rating: 6, category: "Breakfast" },
      { name: "Munchkins", rating: 8, category: "Dessert" },
      { name: "Coolatta", rating: 6, category: "Drink" },
    ],
  },
];

// "McDonald's" -> "/restaurants/mcdonald-s.jpg"
export function restaurantImagePath(restaurant: string): string {
  const slug = restaurant.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/restaurants/${slug}.jpg`;
}
