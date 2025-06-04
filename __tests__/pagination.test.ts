import { getPageRange } from '@/utils/pagination'

describe('getPageRange', () => {
  it('calculates range for first page', () => {
    expect(getPageRange(1, 10)).toEqual({ from: 0, to: 9 });
  });

  it('calculates range for arbitrary page', () => {
    expect(getPageRange(3, 20)).toEqual({ from: 40, to: 59 });
  });
});
