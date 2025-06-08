import { render, screen, fireEvent } from '@testing-library/react';
import MakeOfferModal from '@/components/ui/makeOfferModal';

describe('MakeOfferModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    maxPrice: 100,
    isSubmitting: false,
  };

  test('shows error if offer is blank', () => {
    render(<MakeOfferModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Submit Offer'));
    expect(screen.getByText('Offer amount is required.')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('shows error if offer is not positive', () => {
    render(<MakeOfferModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Your offer ($)'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Submit Offer'));
    expect(screen.getByText('Please enter a valid offer.')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('shows error if offer is higher than price', () => {
    render(<MakeOfferModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Your offer ($)'), { target: { value: '150' } });
    fireEvent.click(screen.getByText('Submit Offer'));
    expect(screen.getByText('Offer must be lower than the listed price.')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with numeric offer', () => {
    render(<MakeOfferModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('Your offer ($)'), { target: { value: '50' } });
    fireEvent.click(screen.getByText('Submit Offer'));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(50, '');
  });
});
