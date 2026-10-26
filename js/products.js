/*
 * KATIEB SUPERMARKET – CATEGORIES AND PRODUCTS
 * ------------------------------------------------------------------
 * ALL PRODUCTS, PRICES AND OFFERS BELOW ARE SAMPLES for development.
 * Replace them with KatieB's real catalogue before launch.
 *
 * Each product:
 *   id          unique text id (no spaces)
 *   name        product name
 *   description short sentence
 *   category    one of the category ids below
 *   price       normal price in naira (number)
 *   salePrice   OPTIONAL – only set when there is a genuine discount
 *               (must be lower than price). Badges and "Save" amounts
 *               are calculated from this; nothing is shown without it.
 *   unit        text after the price, e.g. "per kg", "each", "pack of 12"
 *   step        OPTIONAL – quantity step (0.5 for items sold by weight).
 *               Default 1.
 *   featured    true = shown under "Popular Picks"
 *   stock       OPTIONAL – "in" or "out". Leave out when you have no
 *               reliable stock information (nothing is displayed then).
 *   image       image key from js/images.js, or null for a
 *               "photo coming soon" tile
 */
window.CATEGORIES = [
  { id: "fruit-veg",     name: "Fresh Fruits and Vegetables",      icon: "apple",   image: "c-fruitveg" },
  { id: "meat-fish",     name: "Meat, Fish and Poultry",           icon: "meat",    image: "c-meat" },
  { id: "dairy",         name: "Dairy, Eggs and Chilled Products", icon: "dairy",   image: "c-dairy" },
  { id: "bakery",        name: "Bread and Bakery",                 icon: "bread",   image: "c-bakery" },
  { id: "grains",        name: "Rice, Grains and Pasta",           icon: "grains",  image: "c-grains" },
  { id: "drinks",        name: "Drinks and Beverages",             icon: "drinks",  image: null },
  { id: "snacks",        name: "Snacks and Confectionery",         icon: "snacks",  image: null },
  { id: "frozen",        name: "Frozen Foods",                     icon: "frozen",  image: null },
  { id: "household",     name: "Cleaning and Household Supplies",  icon: "spray",   image: null },
  { id: "personal-care", name: "Personal Care",                    icon: "drop",    image: null },
  { id: "baby",          name: "Baby Products",                    icon: "baby",    image: null }
];

window.PRODUCTS = [
  // ---- Fresh fruits and vegetables ----
  { id: "tomatoes",  name: "Fresh Tomatoes",       description: "Ripe red tomatoes, sold by the kilogram.",               category: "fruit-veg", price: 1800, unit: "per kg", step: 0.5, featured: true,  image: "p-tomatoes" },
  { id: "red-peppers", name: "Red Bell Peppers",   description: "Sweet red peppers for cooking, salads and stir-fries.",  category: "fruit-veg", price: 2500, salePrice: 2200, unit: "per kg", step: 0.5, featured: true, image: "p-red-peppers" },
  { id: "yellow-peppers", name: "Yellow Bell Peppers", description: "Bright, mild yellow peppers.",                      category: "fruit-veg", price: 2600, unit: "per kg", step: 0.5, image: "p-yellow-peppers" },
  { id: "bananas",   name: "Bananas",              description: "A fresh bunch of bananas.",                              category: "fruit-veg", price: 1200, unit: "per bunch", featured: true, image: "p-bananas" },
  { id: "oranges",   name: "Oranges",              description: "Juicy oranges, sold by the kilogram.",                   category: "fruit-veg", price: 1500, salePrice: 1300, unit: "per kg", step: 0.5, featured: true, image: "p-oranges" },
  { id: "lemons",    name: "Lemons",               description: "Fresh lemons for cooking and drinks.",                   category: "fruit-veg", price: 2000, unit: "per kg", step: 0.5, image: "p-lemons" },
  { id: "limes",     name: "Limes",                description: "Fresh green limes.",                                     category: "fruit-veg", price: 1800, unit: "per kg", step: 0.5, image: "p-limes" },
  { id: "chilli",    name: "Red Chilli Peppers",   description: "Hot red chilli peppers.",                                category: "fruit-veg", price: 900,  unit: "250 g pack", image: "p-chilli" },
  { id: "aubergines", name: "Aubergines (Eggplant)", description: "Glossy aubergines for stews and grilling.",            category: "fruit-veg", price: 1700, unit: "per kg", step: 0.5, image: "p-aubergines" },
  { id: "cauliflower", name: "Cauliflower",        description: "A whole head of cauliflower.",                           category: "fruit-veg", price: 2200, unit: "each", image: "p-cauliflower" },
  { id: "broccoli",  name: "Broccoli",             description: "Fresh green broccoli heads.",                            category: "fruit-veg", price: 2000, unit: "each", image: "p-broccoli" },
  { id: "romanesco", name: "Romanesco Broccoli",   description: "Lime-green romanesco with a nutty flavour.",             category: "fruit-veg", price: 2600, unit: "each", image: "p-romanesco" },
  { id: "coconuts",  name: "Coconuts",             description: "Whole coconuts.",                                        category: "fruit-veg", price: 800,  unit: "each", image: "p-coconuts" },
  { id: "pomegranates", name: "Pomegranates",      description: "Ripe pomegranates.",                                     category: "fruit-veg", price: 2800, unit: "per kg", step: 0.5, image: "p-pomegranates" },
  { id: "potatoes",  name: "Potatoes",             description: "Everyday potatoes, sold by the kilogram.",               category: "fruit-veg", price: 1600, unit: "per kg", step: 0.5, featured: true, image: "p-potatoes" },
  { id: "mushrooms", name: "Mushrooms",            description: "Packed white mushrooms.",                                category: "fruit-veg", price: 1800, unit: "250 g pack", image: "p-mushrooms" },
  { id: "courgettes", name: "Courgettes (Zucchini)", description: "Fresh green courgettes.",                             category: "fruit-veg", price: 1500, unit: "per kg", step: 0.5, image: "p-zucchini" },

  // ---- Meat, fish and poultry ----
  { id: "chicken-breast", name: "Chicken Breast",  description: "Skinless chicken breast fillets.",                       category: "meat-fish", price: 6500, unit: "per kg", step: 0.5, featured: true, image: "p-chicken" },
  { id: "beef-steak", name: "Beef Steak",          description: "Beef steak cut for grilling or frying.",                 category: "meat-fish", price: 9800, salePrice: 9200, unit: "per kg", step: 0.5, image: "p-steak" },

  // ---- Dairy, eggs and chilled ----
  { id: "milk",      name: "Fresh Milk",           description: "Fresh milk in a 1 litre pack.",                          category: "dairy", price: 1900, salePrice: 1700, unit: "1 litre", featured: true, image: "p-milk" },
  { id: "eggs",      name: "Eggs",                 description: "A tray of 30 eggs.",                                     category: "dairy", price: 4800, unit: "tray of 30", featured: true, image: "p-eggs" },

  // ---- Bread and bakery ----
  { id: "bread",     name: "Wholegrain Bread",     description: "A sliced wholegrain loaf.",                              category: "bakery", price: 1800, unit: "per loaf", image: "p-bread" },

  // ---- Rice, grains and pasta ----
  { id: "pasta",     name: "Penne Pasta",          description: "Dried penne pasta.",                                     category: "grains", price: 1500, unit: "500 g pack", image: "p-pasta" },
  { id: "rice",      name: "Rice",                 description: "Long-grain rice for everyday meals.",                    category: "grains", price: 2600, salePrice: 2400, unit: "per kg", featured: true, image: "p-rice" },

  // ---- Categories waiting for photographs (shown with a "photo coming soon" tile) ----
  { id: "water",     name: "Bottled Water 75cl",   description: "Drinking water, pack of 12 bottles.",                    category: "drinks", price: 2400, salePrice: 2100, unit: "pack of 12", image: null },
  { id: "juice",     name: "Fruit Juice",          description: "Ready-to-drink fruit juice.",                            category: "drinks", price: 1800, unit: "1 litre", image: null },
  { id: "biscuits",  name: "Plain Biscuits",       description: "Tea-time biscuits.",                                     category: "snacks", price: 700,  unit: "per pack", image: null },
  { id: "frozen-veg", name: "Frozen Mixed Vegetables", description: "Frozen mixed vegetables.",                          category: "frozen", price: 3200, unit: "1 kg", image: null },
  { id: "frozen-chicken", name: "Frozen Chicken",  description: "Frozen chicken pieces.",                                 category: "frozen", price: 5800, unit: "1 kg", image: null },
  { id: "dish-soap", name: "Dishwashing Liquid",   description: "Liquid soap for washing dishes.",                        category: "household", price: 1500, unit: "750 ml", image: null },
  { id: "detergent", name: "Laundry Detergent",    description: "Powder detergent for laundry.",                          category: "household", price: 4200, salePrice: 3800, unit: "2 kg", image: null },
  { id: "bath-soap", name: "Bathing Soap",         description: "Bathing soap bars.",                                     category: "personal-care", price: 2200, unit: "pack of 4", image: null },
  { id: "toothpaste", name: "Toothpaste",          description: "Fluoride toothpaste.",                                   category: "personal-care", price: 1300, salePrice: 1100, unit: "100 ml", image: null },
  { id: "baby-wipes", name: "Baby Wipes",          description: "Soft wipes for babies.",                                 category: "baby", price: 1800, unit: "pack of 80", image: null },
  { id: "diapers",   name: "Baby Diapers",         description: "Disposable baby diapers.",                               category: "baby", price: 7500, unit: "pack of 40", image: null }
];
