import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import MakeOfferModal from '../components/ui/makeOfferModal';

// Mock the useTranslation hook
jest.mock('../i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        makeOfferModalTitle: 'Make an Offer',
        makeOfferModalDescription:
          "Suggest a lower price and include a message if you'd like.",
        yourOffer: 'Your offer (₪)',
        optionalMessage: 'Optional message to the seller',
        enterValidOffer: 'Please enter a valid offer.',
        offerTooHigh: 'Offer must be lower than the listed price.',
        cancel: 'Cancel',
        submitOffer: 'Submit Offer',
        submitting: 'Submitting...',
      };
      return translations[key] || key;
    },
  }),
}));

describe('MakeOfferModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <MakeOfferModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        maxPrice={100}
      />,
    );
    expect(screen.getByText('Make an Offer')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Suggest a lower price and include a message if you'd like.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your offer (₪)')).toBeInTheDocument();
  });

  it('calls onClose when the cancel button is clicked', () => {
    render(
      <MakeOfferModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        maxPrice={100}
      />,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows an error if the offer is invalid', () => {
    render(
      <MakeOfferModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        maxPrice={100}
      />,
    );

    fireEvent.click(screen.getByText('Submit Offer'));
    expect(screen.getByText('Please enter a valid offer.')).toBeInTheDocument();
  });

  it('shows an error if the offer is too high', () => {
    render(
      <MakeOfferModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        maxPrice={100}
      />,
    );

    const offerInput = screen.getByPlaceholderText('Your offer (₪)');
    fireEvent.change(offerInput, { target: { value: '150' } });
    fireEvent.click(screen.getByText('Submit Offer'));
    expect(
      screen.getByText('Offer must be lower than the listed price.'),
    ).toBeInTheDocument();
  });

  it('calls onSubmit with the correct values when the offer is valid', () => {
    render(
      <MakeOfferModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        maxPrice={100}
      />,
    );

    const offerInput = screen.getByPlaceholderText('Your offer (₪)');
    const messageInput = screen.getByPlaceholderText(
      'Optional message to the seller',
    );

    fireEvent.change(offerInput, { target: { value: '50' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByText('Submit Offer'));

    expect(mockOnSubmit).toHaveBeenCalledWith(50, 'Test message');
  });
}); 