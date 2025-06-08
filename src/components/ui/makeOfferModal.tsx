'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function MakeOfferModal({
  isOpen,
  onClose,
  onSubmit,
  maxPrice,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: number, message: string) => void;
  maxPrice: number;
  isSubmitting?: boolean;
}) {
  const [offer, setOffer] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const numericOffer = parseFloat(offer);
    if (isNaN(numericOffer) || numericOffer <= 0) {
      setError('Please enter a valid offer.');
    } else if (numericOffer >= maxPrice) {
      setError('Offer must be lower than the listed price.');
    } else {
      setError('');
      onSubmit(numericOffer, message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Suggest a lower price and include a message if you'd like.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input
            type="number"
            placeholder="Your offer (₪)"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            disabled={isSubmitting}
          />
          <Textarea
            placeholder="Optional message to the seller"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
