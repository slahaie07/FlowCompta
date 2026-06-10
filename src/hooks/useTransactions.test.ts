import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTransactions } from './useTransactions';
import { supabase } from '../lib/supabase';

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches transactions for current user by default', async () => {
    const mockUser = { id: 'user123' };
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
    
    const mockData = [{ id: '1', amount: 100, user_id: 'user123' }];
    const selectMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ data: mockData, error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      order: orderMock,
      eq: eqMock,
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user123');
    expect(result.current.transactions).toEqual(mockData);
  });

  it('fetches all transactions when isAdmin is true', async () => {
    const mockData = [{ id: '1', amount: 100 }, { id: '2', amount: 200 }];
    const selectMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });

    (supabase.from as any).mockReturnValue({
      select: selectMock,
      order: orderMock,
    });

    const { result } = renderHook(() => useTransactions(undefined, true));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(orderMock).toHaveBeenCalled();
    // Should NOT call eq('user_id', ...)
    expect(result.current.transactions).toEqual(mockData);
  });
});
