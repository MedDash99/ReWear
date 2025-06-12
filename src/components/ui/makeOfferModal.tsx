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
import { useTranslation } from '@/i18n/useTranslation';

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
  const { t } = useTranslation();
  const [offer, setOffer] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!offer.trim()) {
      setError('Offer amount is required.');
      return;
    }

    const numericOffer = parseFloat(offer);
    if (isNaN(numericOffer) || numericOffer <= 0) {
      setError(t('enterValidOffer'));
      return;
    }

    if (numericOffer >= maxPrice) {
      setError(t('offerTooHigh'));
      return;
    }

    setError('');
    onSubmit(numericOffer, message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('makeOfferModalTitle')}</DialogTitle>
          <DialogDescription>
            {t('makeOfferModalDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input
            type="number"
            placeholder={t('yourOffer')}
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            disabled={isSubmitting}
            required
            min={1}
            step="0.01"
          />
          <Textarea
            placeholder={t('optionalMessage')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('submitting') : t('submitOffer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
