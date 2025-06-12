'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSellerButton } from '@/components/messaging/MessageSellerButton';
import { useTranslation } from '@/i18n/useTranslation';

interface ProductDetailProps {
  product: {
    id?: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    shippingInfo: string;
    returnPolicy: string;
    status?: string;
    seller?: {
      id?: string;
      name: string;
      avatarUrl?: string;
    };
  };
  onMakeOffer?: () => void;
  isOwner?: boolean;
}

export default function ProductDetail({ product, onMakeOffer, isOwner }: ProductDetailProps) {
  const { t } = useTranslation();
  const isSold = product.status === 'Sold';
  
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
      <div className="rounded-xl overflow-hidden transition-all duration-300 ease-in-out">
        <div className="relative">
          <Image
            src={product.imageUrl}
            alt={t('productImageAlt', { productName: product.name })}
            width={600}
            height={600}
            className="w-full h-auto object-cover rounded-xl"
          />
          {isSold && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
              <span className="text-white text-xl sm:text-2xl font-bold">{t('sold')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6 transition-all duration-300 ease-in-out">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-xl sm:text-2xl text-teal-600 font-bold">₪{product.price.toFixed(2)}</p>
        </div>

        {isSold ? (
          <div className="mb-4 sm:mb-6">
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold text-sm sm:text-base">{t('itemHasBeenSold')}</p>
              <p className="text-xs sm:text-sm">{t('itemNoLongerAvailable')}</p>
            </div>
          </div>
        ) : !isOwner ? (
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg text-sm sm:text-base transition-colors duration-200">
                {t('buyNow')}
              </Button>
              {onMakeOffer && (
                <Button 
                  variant="outline" 
                  className="border-teal-600 text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-lg text-sm sm:text-base transition-colors duration-200"
                  onClick={onMakeOffer}
                >
                  {t('makeOffer')}
                </Button>
              )}
            </div>
            {product.seller && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <MessageSellerButton
                    sellerId={product.seller.id || ''}
                    sellerName={product.seller.name}
                    itemId={product.id || ''}
                    itemTitle={product.name}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg text-sm sm:text-base w-full transition-colors duration-200"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 sm:mb-6">
            <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
              <p className="font-semibold text-sm sm:text-base">{t('yourListing')}</p>
              <p className="text-xs sm:text-sm">{t('cannotPurchaseOwnItem')}</p>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-base sm:text-lg font-medium mb-2">{t('description')}</h2>
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{product.description}</p>
        </div>

        <div className="space-y-2 text-sm sm:text-base text-gray-700">
          <p>
            <span className="font-semibold">{t('availability')}:</span>{' '}
            {isSold ? t('sold') : (product.stock > 0 ? t('inStock') : t('outOfStock'))}
          </p>
          <p>
            <span className="font-semibold">{t('shipping')}:</span> {product.shippingInfo}
          </p>
          <p>
            <span className="font-semibold">{t('returns')}:</span> {product.returnPolicy}
          </p>
          {product.seller && (
            <p>
              <span className="font-semibold">{t('seller')}:</span> {product.seller.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
