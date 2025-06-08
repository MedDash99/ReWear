import { createClient } from '@/utils/supabase/server';

async function cleanInvalidOffers() {
  const supabase = await createClient();

  // Find offers where offer_price or product_id is null
  const { data: invalidOffers, error } = await supabase
    .from('offers')
    .select('*')
    .or('offer_price.is.null,product_id.is.null');

  if (error) {
    console.error('Error fetching invalid offers:', error);
    return;
  }

  if (!invalidOffers || invalidOffers.length === 0) {
    console.log('No invalid offers found.');
    return;
  }

  console.log(`Found ${invalidOffers.length} invalid offer(s).`);

  for (const offer of invalidOffers) {
    console.log(`Removing offer ${offer.id} with product_id=${offer.product_id} and offer_price=${offer.offer_price}`);
    await supabase.from('offers').delete().eq('id', offer.id);
  }

  console.log('Cleanup complete.');
}

cleanInvalidOffers();
