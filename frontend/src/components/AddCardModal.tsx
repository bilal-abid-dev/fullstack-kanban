'use client';

import { useState, useEffect, useRef } from 'react';

interface AddCardModalProps {
  columnId: string;
  onSubmit: (columnId: string, title: string, details: string) => Promise<void>;
  onClose: () => void;
}

export function AddCardModal({ columnId, onSubmit, onClose }: AddCardModalProps) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setSubmitting(true);
    try {
      await onSubmit(columnId, title.trim(), details.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="mx-4 w-full max-w-md rounded-[12px] border border-black bg-[#B89E97] p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-black">Add New Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-black">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[12px] border border-black bg-[#DECCCC] px-3 py-2 text-black outline-none focus:ring-2 focus:ring-[#1098F7]"
              placeholder="Card title"
              required
              maxLength={100}
            />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-black">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-[12px] border border-black bg-[#DECCCC] px-3 py-2 text-black outline-none focus:ring-2 focus:ring-[#1098F7]"
              placeholder="Add details..."
              maxLength={500}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
            className="rounded-[12px] bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1098F7] hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
            className="rounded-[12px] bg-[#1098F7] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
