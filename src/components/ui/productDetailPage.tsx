'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ProductDetailProps {
  product: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    shippingInfo: string;
    returnPolicy: string;
    status?: string;
    seller?: {
      name: string;
      avatarUrl?: string;
    };
  };
  onMakeOffer?: () => void;
  isOwner?: boolean;
}

export default function ProductDetail({ product, onMakeOffer, isOwner }: ProductDetailProps) {
  const isSold = product.status === 'Sold';
  
  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <motion.div
        className="rounded-xl overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-auto object-cover rounded-xl"
          />
          {isSold && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
              <span className="text-white text-2xl font-bold">SOLD</span>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-2xl text-teal-600 font-bold mb-4">${product.price.toFixed(2)}</p>

        {isSold ? (
          <div className="mb-6">
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">This item has been sold</p>
              <p className="text-sm">This product is no longer available for purchase.</p>
            </div>
          </div>
        ) : !isOwner ? (
          <div className="flex gap-4 mb-6">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-base">
              Buy Now
            </Button>
            {onMakeOffer && (
              <Button 
                variant="outline" 
                className="border-teal-600 text-teal-600 hover:bg-teal-50 px-6 py-2 rounded-lg text-base"
                onClick={onMakeOffer}
              >
                Make Offer
              </Button>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">This is your listing</p>
              <p className="text-sm">You cannot purchase or make offers on your own items.</p>
            </div>
          </div>
        )}

        <h2 className="text-lg font-medium mb-1">Description</h2>
        <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Availability:</span>{' '}
            {isSold ? 'Sold' : (product.stock > 0 ? 'In Stock' : 'Out of Stock')}
          </p>
          <p>
            <span className="font-semibold">Shipping:</span> {product.shippingInfo}
          </p>
          <p>
            <span className="font-semibold">Returns:</span> {product.returnPolicy}
          </p>
          {product.seller && (
            <p>
              <span className="font-semibold">Seller:</span> {product.seller.name}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
