// Category system with internal IDs and translation mappings
export const CATEGORY_IDS = {
  CLOTHING: 'clothing',
  SHOES: 'shoes', 
  ACCESSORIES: 'accessories',
  BAGS: 'bags'
} as const;

export type CategoryId = typeof CATEGORY_IDS[keyof typeof CATEGORY_IDS];

// Map internal category IDs to translation keys
export const CATEGORY_TRANSLATIONS: Record<CategoryId, string> = {
  [CATEGORY_IDS.CLOTHING]: 'clothing',
  [CATEGORY_IDS.SHOES]: 'shoes', 
  [CATEGORY_IDS.ACCESSORIES]: 'accessories',
  [CATEGORY_IDS.BAGS]: 'bags'
};

// Legacy mapping for migration - maps old English strings to new IDs
export const LEGACY_CATEGORY_MAPPING: Record<string, CategoryId> = {
  'Clothing': CATEGORY_IDS.CLOTHING,
  'Shoes': CATEGORY_IDS.SHOES,
  'Accessories': CATEGORY_IDS.ACCESSORIES, 
  'Bags': CATEGORY_IDS.BAGS
};

// Get all available category IDs
export function getAllCategoryIds(): CategoryId[] {
  return Object.values(CATEGORY_IDS);
}

// Get translation key for a category ID
export function getCategoryTranslationKey(categoryId: CategoryId): string {
  return CATEGORY_TRANSLATIONS[categoryId];
}

// Convert legacy category string to new ID (for migration/compatibility)
export function legacyCategoryToId(legacyCategory: string): CategoryId | null {
  return LEGACY_CATEGORY_MAPPING[legacyCategory] || null;
}

// Check if a category ID is valid
export function isValidCategoryId(categoryId: string): categoryId is CategoryId {
  return Object.values(CATEGORY_IDS).includes(categoryId as CategoryId);
} 