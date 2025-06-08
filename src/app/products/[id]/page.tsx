'use client';
import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProductDetail from '@/components/ui/productDetailPage';
import MakeOfferModal from '@/components/ui/makeOfferModal';
import { toast } from 'sonner';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  shippingInfo: string;
  returnPolicy: string;
  status?: string;
  sellerId?: string;
  seller?: {
    id?: string;
    name: string;
    avatarUrl?: string;
  };
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unwrap the params Promise
  const { id } = use(params);

  useEffect(() => {
    if (status === 'loading') return;

    // Fetch from the individual product API that includes full details
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        // The API returns a different structure, so we need to map it
        const productData: Product = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          stock: data.stock || 1,
          shippingInfo: data.shippingInfo || "Free shipping on orders over $50",
          returnPolicy: data.returnPolicy || "30-day return policy",
          status: data.status,
          sellerId: data.sellerId,
          seller: data.seller ? {
            id: data.seller.id || data.sellerId,
            name: data.seller.name,
            avatarUrl: data.seller.avatarUrl
          } : undefined
        };
        setProduct(productData);
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        toast.error('Failed to load product details');
      });
  }, [status, id]);

  const handleMakeOffer = async (offer: number, message: string) => {
    if (!session?.user) {
      toast.error('Please log in to make an offer');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${id}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit offer');
      }

      toast.success('Offer submitted successfully!');
      setIsOfferModalOpen(false);
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  const isOwner = session?.user?.id === product.sellerId;
  const isSold = product.status === 'Sold';
  const canMakeOffer = session?.user && !isOwner && !isSold;

  return (
    <div className="container mx-auto py-8">
      <ProductDetail 
        product={product} 
        onMakeOffer={canMakeOffer ? () => setIsOfferModalOpen(true) : undefined}
        isOwner={isOwner}
      />
      {canMakeOffer && (
        <MakeOfferModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          onSubmit={handleMakeOffer}
          maxPrice={product.price}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
} 