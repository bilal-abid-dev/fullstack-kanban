import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Card } from '@/components/Card';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

const mockCard = {
  id: 'card-1',
  column_id: 'col-1',
  title: 'Test Card',
  details: 'Test details',
  position: 0,
  created_at: new Date().toISOString(),
};

const mockDeleteCard = vi.fn();
const mockMoveCard = vi.fn();

vi.mock('@/hooks/useBoard', () => ({
  useCards: () => ({
    deleteCard: mockDeleteCard,
    moveCard: mockMoveCard,
  }),
}));

describe('Card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('renders card title and details', () => {
    render(<Card card={mockCard} columnId="col-1" />);
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test details')).toBeInTheDocument();
  });

  it('renders delete button', () => {
    render(<Card card={mockCard} columnId="col-1" />);
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls deleteCard on delete button click', async () => {
    mockDeleteCard.mockResolvedValue(undefined);
    
    render(<Card card={mockCard} columnId="col-1" />);
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(mockDeleteCard).toHaveBeenCalledWith('card-1');
    });
  });

  it('does not call deleteCard when user cancels confirm', async () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => false);
    mockDeleteCard.mockResolvedValue(undefined);
    
    render(<Card card={mockCard} columnId="col-1" />);
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(mockDeleteCard).not.toHaveBeenCalled();
    });
  });

  it('does not render details when empty', () => {
    const cardWithoutDetails = { ...mockCard, details: null };
    render(<Card card={cardWithoutDetails} columnId="col-1" />);
    
    expect(screen.queryByText('Test details')).not.toBeInTheDocument();
  });
});