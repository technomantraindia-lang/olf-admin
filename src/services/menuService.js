// Menu Service for IRCTC eCatering v3 Specifications (Domain 4: Menu Items & Customisation Engine)
// Stores menu items per outlet in localStorage and exposes CRUD + toggle status operations.

const MENU_STORAGE_KEY_PREFIX = 'olf_stores_menu_data_v1_';

export const MENU_CATEGORIES = [
  'All Categories',
  'Thali & Meals',
  'Biryani & Rice',
  'North Indian',
  'Mains & Curries',
  'Snacks & Fast Food',
  'Jain Special',
  'Beverages & Desserts',
];

export const CUISINE_TYPES = [
  'NORTH_INDIAN',
  'SOUTH_INDIAN',
  'RAJASTHANI',
  'GUJRATI',
  'MUGHALAI',
  'PUNJABI',
  'CHINESE',
  'FAST_FOOD',
  'CONTINENTAL',
];

export const DIETARY_TYPES = [
  { value: 'VEG', label: 'Pure Veg', color: 'emerald', dotBg: 'bg-emerald-600' },
  { value: 'NON_VEG', label: 'Non-Veg', color: 'rose', dotBg: 'bg-rose-600' },
  { value: 'EGG', label: 'Contains Egg', color: 'amber', dotBg: 'bg-amber-600' },
  { value: 'JAIN', label: 'Jain (No Onion/Garlic)', color: 'teal', dotBg: 'bg-teal-600' },
];

export const DEFAULT_MOCK_ITEMS = [
  {
    id: 'MNU001',
    name: 'Deluxe Executive Rail Thali',
    category: 'Thali & Meals',
    cuisine: 'NORTH_INDIAN',
    dietary: 'VEG',
    description: 'Paneer butter masala, yellow dal tadka, jeera rice, 3 butter tawa rotis, salad, pickle & 1 gulab jamun.',
    basePrice: 220,
    gstRate: 0.05,
    preparationTime: 15,
    status: 'ENABLED', // 'ENABLED' | 'DISABLED'
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 15,
    isPopular: true,
  },
  {
    id: 'MNU002',
    name: 'Special Dal Baati Churma Rajasthani Thali',
    category: 'Thali & Meals',
    cuisine: 'RAJASTHANI',
    dietary: 'VEG',
    description: 'Authentic 4 baatis dipped in pure desi ghee, spicy panchmel dal, sweet churma laddu & garlic chutney.',
    basePrice: 250,
    gstRate: 0.05,
    preparationTime: 20,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 20,
    isPopular: true,
  },
  {
    id: 'MNU003',
    name: 'Hyderabadi Dum Veg Biryani',
    category: 'Biryani & Rice',
    cuisine: 'HYDERABADI',
    dietary: 'VEG',
    description: 'Fragrant basmati rice layered with spiced garden vegetables, saffron & fried onions. Served with cucumber raita.',
    basePrice: 180,
    gstRate: 0.05,
    preparationTime: 20,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 15,
    isPopular: false,
  },
  {
    id: 'MNU004',
    name: 'Jain Special Shahi Paneer Meal',
    category: 'Jain Special',
    cuisine: 'NORTH_INDIAN',
    dietary: 'JAIN',
    description: 'Strictly prepared without onion, garlic, or root vegetables. Shahi paneer, jeera rice, 3 rotis & curd.',
    basePrice: 230,
    gstRate: 0.05,
    preparationTime: 18,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 15,
    isPopular: false,
  },
  {
    id: 'MNU005',
    name: 'Paneer Butter Masala with 2 Laccha Parathas',
    category: 'Mains & Curries',
    cuisine: 'PUNJABI',
    dietary: 'VEG',
    description: 'Cottage cheese cubes tossed in rich tomato cashew gravy, served hot with crispy multi-layered parathas.',
    basePrice: 195,
    gstRate: 0.05,
    preparationTime: 15,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 10,
    isPopular: true,
  },
  {
    id: 'MNU006',
    name: 'Standard Janta Khana (IRCTC Approved)',
    category: 'Thali & Meals',
    cuisine: 'NORTH_INDIAN',
    dietary: 'VEG',
    description: 'Mandatory standard passenger meal: 7 fresh wheat puris, spiced potato curry (aloo sabzi) & tangy mango pickle.',
    basePrice: 80,
    gstRate: 0.05,
    preparationTime: 10,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 5,
    isPopular: false,
  },
  {
    id: 'MNU007',
    name: 'Hot Paneer Tikka Kathi Roll (2 Pcs)',
    category: 'Snacks & Fast Food',
    cuisine: 'FAST_FOOD',
    dietary: 'VEG',
    description: 'Tandoori roasted paneer wrapped in rumali flatbread with mint mayo & crunchy pickled onions.',
    basePrice: 140,
    gstRate: 0.05,
    preparationTime: 12,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 10,
    isPopular: false,
  },
  {
    id: 'MNU008',
    name: 'Hot Cutting Chai Flask (500ml - Serves 3)',
    category: 'Beverages & Desserts',
    cuisine: 'FAST_FOOD',
    dietary: 'VEG',
    description: 'Adrak-Elaichi boiled railway tea packed in insulated leak-proof travel flask with 3 paper cups.',
    basePrice: 90,
    gstRate: 0.05,
    preparationTime: 8,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 10,
    isPopular: false,
  },
  {
    id: 'MNU009',
    name: 'Warm Gulab Jamun (2 Pieces in Sugar Syrup)',
    category: 'Beverages & Desserts',
    cuisine: 'NORTH_INDIAN',
    dietary: 'VEG',
    description: 'Khoya dumplings fried and soaked in cardamom-rose flavoured sugar syrup. Served warm.',
    basePrice: 60,
    gstRate: 0.05,
    preparationTime: 5,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 5,
    isPopular: false,
  },
  {
    id: 'MNU010',
    name: 'Packaged Drinking Water (Rail Neer 1 Litre)',
    category: 'Beverages & Desserts',
    cuisine: 'FAST_FOOD',
    dietary: 'VEG',
    description: 'Chilled or room-temperature certified IRCTC Rail Neer sealed bottle.',
    basePrice: 15,
    gstRate: 0.0,
    preparationTime: 2,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1559839914-ba2ac67223b2?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 0,
    isPopular: false,
  },
];

export const NON_VEG_ADDITIONAL_ITEMS = [
  {
    id: 'MNU011',
    name: 'Hyderabadi Chicken Dum Biryani (With Egg)',
    category: 'Biryani & Rice',
    cuisine: 'HYDERABADI',
    dietary: 'NON_VEG',
    description: 'Tender chicken marinated in roasted ground spices and herbs, slow cooked in dum pot with long grain basmati rice.',
    basePrice: 260,
    gstRate: 0.05,
    preparationTime: 22,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 20,
    isPopular: true,
  },
  {
    id: 'MNU012',
    name: 'Butter Chicken Masala with 3 Butter Rotis',
    category: 'Mains & Curries',
    cuisine: 'MUGHALAI',
    dietary: 'NON_VEG',
    description: 'Boneless chicken tikka simmered in creamy makhani gravy. Served with 3 whole wheat butter rotis.',
    basePrice: 280,
    gstRate: 0.05,
    preparationTime: 20,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 15,
    isPopular: true,
  },
  {
    id: 'MNU013',
    name: 'Double Egg Curry with Steamed Basmati Rice',
    category: 'Thali & Meals',
    cuisine: 'NORTH_INDIAN',
    dietary: 'EGG',
    description: 'Two boiled eggs fried golden and cooked in thick onion-tomato gravy with steamed basmati rice.',
    basePrice: 170,
    gstRate: 0.05,
    preparationTime: 15,
    status: 'ENABLED',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    packagingCharges: 15,
    isPopular: false,
  },
];

export const menuService = {
  /**
   * Fetch menu for a given outlet ID.
   * If not found, initializes with appropriate default items matching outlet's mealType.
   */
  getMenuByOutlet(outletId, mealType = 'VEG_AND_NON_VEG') {
    if (!outletId) return [];
    try {
      const storageKey = `${MENU_STORAGE_KEY_PREFIX}${outletId.toUpperCase()}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }

      // Initialize default menu
      const isPureVeg = mealType === 'PURE_VEG';
      const initialItems = isPureVeg
        ? DEFAULT_MOCK_ITEMS
        : [...DEFAULT_MOCK_ITEMS, ...NON_VEG_ADDITIONAL_ITEMS];

      localStorage.setItem(storageKey, JSON.stringify(initialItems));
      return initialItems;
    } catch (err) {
      console.error('Error fetching menu items:', err);
      return DEFAULT_MOCK_ITEMS;
    }
  },

  /**
   * Save all menu items for an outlet
   */
  saveMenu(outletId, items) {
    if (!outletId) return;
    try {
      const storageKey = `${MENU_STORAGE_KEY_PREFIX}${outletId.toUpperCase()}`;
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving menu:', err);
    }
  },

  /**
   * Add a new menu item to an outlet
   */
  addMenuItem(outletId, newItem) {
    const list = this.getMenuByOutlet(outletId);
    const id = newItem.id || `MNU${String(Date.now()).slice(-4)}`;
    const fullItem = {
      ...newItem,
      id,
      status: newItem.status || 'ENABLED',
      gstRate: newItem.gstRate !== undefined ? Number(newItem.gstRate) : 0.05,
      basePrice: Number(newItem.basePrice || 100),
      preparationTime: Number(newItem.preparationTime || 15),
      packagingCharges: Number(newItem.packagingCharges || 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [fullItem, ...list];
    this.saveMenu(outletId, updated);
    return fullItem;
  },

  /**
   * Update an existing menu item
   */
  updateMenuItem(outletId, itemId, updates) {
    const list = this.getMenuByOutlet(outletId);
    const updated = list.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    this.saveMenu(outletId, updated);
    return updated.find((i) => i.id === itemId);
  },

  /**
   * Toggle item availability between 'ENABLED' (Available) and 'DISABLED' (Sold Out)
   */
  toggleItemStatus(outletId, itemId) {
    const list = this.getMenuByOutlet(outletId);
    let nextStatus = 'ENABLED';
    const updated = list.map((item) => {
      if (item.id === itemId) {
        nextStatus = item.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
        return {
          ...item,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    this.saveMenu(outletId, updated);
    return nextStatus;
  },

  /**
   * Delete a menu item
   */
  deleteMenuItem(outletId, itemId) {
    const list = this.getMenuByOutlet(outletId);
    const updated = list.filter((i) => i.id !== itemId);
    this.saveMenu(outletId, updated);
    return true;
  },

  /**
   * Reset menu to defaults
   */
  resetMenu(outletId, mealType) {
    const isPureVeg = mealType === 'PURE_VEG';
    const initialItems = isPureVeg
      ? DEFAULT_MOCK_ITEMS
      : [...DEFAULT_MOCK_ITEMS, ...NON_VEG_ADDITIONAL_ITEMS];
    this.saveMenu(outletId, initialItems);
    return initialItems;
  },
};
