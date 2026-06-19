import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTransactions } from './useTransactions';
import { supabase } from '../lib/supabase';

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type || 'purchase',
    amount: parseFloat(String(row.amount)) || 0,
    description: row.description || row.label || '',
    date: row.date || (row.tx_date ? new Date(String(row.tx_date)).getTime() : new Date(String(row.created_at)).getTime()),
    status: row.status || 'pending',
    category: row.category || 'Général',
    context: row.context || 'business',
    aiConfidence: row.ai_confidence ?? undefined,
  };
}

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches transactions for current user by default', async () => {
    const mockUser = { id: 'user123' };
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

    const mockData = [{ id: '1', amount: 100, user_id: 'user123', created_at: '2024-06-01T12:00:00Z' }];
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
    expect(result.current.transactions).toEqual(mockData.map(mapRow));
  });

  it('fetches all transactions when isAdmin is true', async () => {
    const mockUser = { id: 'admin123' };
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: mockUser } }, error: null });

    const mockData = [
      { id: '1', amount: 100, created_at: '2024-06-01T12:00:00Z' },
      { id: '2', amount: 200, created_at: '2024-06-02T12:00:00Z' },
    ];
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
    expect(result.current.transactions).toEqual(mockData.map(mapRow));
  });
});
