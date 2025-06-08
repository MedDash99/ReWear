import { POST } from '@/app/api/products/[id]/offers/route';
import { NextResponse } from 'next/server';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: 'buyer1' } }),
}));

jest.mock('@/lib/database', () => ({
  getItemById: jest.fn().mockResolvedValue({ id: 1, price: 100, seller_id: 'seller' }),
  createOffer: jest.fn().mockResolvedValue({ id: 123 }),
  getOffersByProduct: jest.fn(),
}));

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { name: 'Buyer', email: 'test' } }),
  }),
}));

describe('POST /api/products/[id]/offers', () => {
  test('returns 400 when offer amount is missing', async () => {
    const request = { json: () => Promise.resolve({}) } as any;
    const res = await POST(request, { params: Promise.resolve({ id: '1' }) } as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe('Offer amount is required');
  });
});
