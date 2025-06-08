import { getPageRange } from '@/utils/pagination'
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for testing (only if environment variables are available)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

describe('getPageRange', () => {
  it('calculates range for first page', () => {
    expect(getPageRange(1, 10)).toEqual({ from: 0, to: 9 });
  });

  it('calculates range for arbitrary page', () => {
    expect(getPageRange(3, 20)).toEqual({ from: 40, to: 59 });
  });
});

// Only run database tests if Supabase is configured
const runDatabaseTests = supabase !== null;

describe('Database Population and Pagination Integration', () => {
  const testItems = [
    {
      name: 'Vintage Gold Watch',
      description: 'Beautiful vintage gold watch with leather strap, perfect for formal occasions',
      price: 150.00,
      category: 'Accessories',
      image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop&crop=center',
      seller_id: '454957a5-d425-4209-ba69-cc3c1846c3bd', // Default test seller ID
      status: 'Active'
    },
    {
      name: 'Red Leather Purse',
      description: 'Stylish red leather purse with multiple compartments, excellent condition',
      price: 75.50,
      category: 'Bags',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&crop=center',
      seller_id: '454957a5-d425-4209-ba69-cc3c1846c3bd',
      status: 'Active'
    },
    {
      name: 'Floral Summer Skirt',
      description: 'Light and airy floral pattern skirt, perfect for summer outings',
      price: 35.00,
      category: 'Clothing',
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop&crop=center',
      seller_id: '454957a5-d425-4209-ba69-cc3c1846c3bd',
      status: 'Active'
    },
    {
      name: 'Elegant Black Dress',
      description: 'Classic black dress suitable for both business and evening wear',
      price: 120.00,
      category: 'Clothing',
      image_url: 'https://images.unsplash.com/photo-1566479179817-c0e8b00db66a?w=500&h=500&fit=crop&crop=center',
      seller_id: '454957a5-d425-4209-ba69-cc3c1846c3bd',
      status: 'Active'
    }
  ];

  beforeAll(async () => {
    if (!runDatabaseTests) {
      console.log('Skipping database tests - Supabase environment variables not configured');
      return;
    }

    // Clean up any existing test items first
    console.log('Cleaning up existing test items...');
    const { error: deleteError } = await supabase!
      .from('items')
      .delete()
      .in('name', testItems.map(item => item.name));

    if (deleteError) {
      console.error('Error cleaning up test items:', deleteError);
    }

    // Add test items to database
    console.log('Adding test items to database...');
    for (const item of testItems) {
      const { error } = await supabase!
        .from('items')
        .insert(item);
      
      if (error) {
        console.error(`Error inserting ${item.name}:`, error);
      } else {
        console.log(`Successfully added ${item.name} to database`);
      }
    }
  });

  afterAll(async () => {
    if (!runDatabaseTests) return;

    // Clean up test items after tests
    console.log('Cleaning up test items after tests...');
    const { error } = await supabase!
      .from('items')
      .delete()
      .in('name', testItems.map(item => item.name));

    if (error) {
      console.error('Error cleaning up test items:', error);
    }
  });

  it('should populate database with test items', async () => {
    if (!runDatabaseTests) {
      console.log('Skipping test - Supabase not configured');
      return;
    }

    // Verify all items were added
    const { data, error } = await supabase!
      .from('items')
      .select('*')
      .in('name', testItems.map(item => item.name));

    expect(error).toBeNull();
    expect(data).toHaveLength(4);
    
    // Check specific items
    const itemNames = data?.map(item => item.name) || [];
    expect(itemNames).toContain('Vintage Gold Watch');
    expect(itemNames).toContain('Red Leather Purse');
    expect(itemNames).toContain('Floral Summer Skirt');
    expect(itemNames).toContain('Elegant Black Dress');
  });

  it('should paginate through items correctly', async () => {
    if (!runDatabaseTests) {
      console.log('Skipping test - Supabase not configured');
      return;
    }

    // Get total count of our test items
    const { data: allItems, error } = await supabase!
      .from('items')
      .select('*')
      .in('name', testItems.map(item => item.name))
      .order('created_at', { ascending: false });

    expect(error).toBeNull();
    expect(allItems).toHaveLength(4);

    // Test pagination with page size of 2
    const pageSize = 2;
    
    // Page 1
    const page1Range = getPageRange(1, pageSize);
    const { data: page1Items } = await supabase!
      .from('items')
      .select('*')
      .in('name', testItems.map(item => item.name))
      .order('created_at', { ascending: false })
      .range(page1Range.from, page1Range.to);

    expect(page1Items).toHaveLength(2);

    // Page 2
    const page2Range = getPageRange(2, pageSize);
    const { data: page2Items } = await supabase!
      .from('items')
      .select('*')
      .in('name', testItems.map(item => item.name))
      .order('created_at', { ascending: false })
      .range(page2Range.from, page2Range.to);

    expect(page2Items).toHaveLength(2);

    // Ensure no overlap between pages
    const page1Ids = page1Items?.map(item => item.id) || [];
    const page2Ids = page2Items?.map(item => item.id) || [];
    const intersection = page1Ids.filter(id => page2Ids.includes(id));
    expect(intersection).toHaveLength(0);
  });

  it('should handle pagination edge cases', async () => {
    if (!runDatabaseTests) {
      console.log('Skipping test - Supabase not configured');
      return;
    }

    // Test page that would be partially empty
    const pageSize = 3;
    const page2Range = getPageRange(2, pageSize);
    
    const { data: page2Items } = await supabase!
      .from('items')
      .select('*')
      .in('name', testItems.map(item => item.name))
      .order('created_at', { ascending: false })
      .range(page2Range.from, page2Range.to);

    // Should only have 1 item (4 total items, page size 3, so page 2 has 1 item)
    expect(page2Items).toHaveLength(1);
  });

  // Additional test to demonstrate the script functionality
  it('should be able to run as a standalone data population script', () => {
    console.log('\n=== STANDALONE DATA POPULATION SCRIPT ===');
    console.log('Items to be added to database:');
    testItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - $${item.price} (${item.category})`);
      console.log(`   Description: ${item.description}`);
    });
    console.log('==========================================\n');
    
    expect(testItems).toHaveLength(4);
    expect(testItems.map(item => item.name)).toEqual([
      'Vintage Gold Watch',
      'Red Leather Purse', 
      'Floral Summer Skirt',
      'Elegant Black Dress'
    ]);
  });
});
