import { getItemById } from '@/lib/database';
import CheckoutClient from '@/components/checkout/CheckoutClient';

type PageProps = {
  params: Promise<{ locale: string; itemId: string; }>;
};

export default async function CheckoutPage({ params }: PageProps) {
  const { itemId } = await params;
  
  try {
    const item = await getItemById(parseInt(itemId));
    return <CheckoutClient initialItem={item} />;
  } catch (error) {
    console.error("Error fetching item:", error);
    return <CheckoutClient initialItem={null} />;
  }
}
