import React, { useState } from 'react';
import Modal from './Modal';
import { memberAPI } from '../lib/memberApi';

interface PlayDayPaymentModalProps {
  isOpen: boolean;
  registration: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PlayDayPaymentModal({
  isOpen,
  registration,
  onClose,
  onSuccess
}: PlayDayPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!registration) return;
    
    setLoading(true);
    setError('');
    
    try {
      await memberAPI.completePlayDayPayment(registration.id, 8.50);
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Betaling mislukt. Probeer het opnieuw.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!registration) return null;

  const playDate = new Date(registration.playDate);
  const formattedDate = playDate.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Modal
      open={isOpen}
      title="💳 Betaling speeldag"
      onClose={onClose}
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border-2 border-primary-200">
          <p className="text-sm text-gray-600 mb-1">Speeldag:</p>
          <p className="text-lg font-bold text-primary-900 capitalize">{formattedDate}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Bedrag:</p>
          <p className="text-3xl font-bold text-gray-900">€8,50</p>
          <p className="text-xs text-gray-500 mt-1">Eenmalige betaling voor deze speeldag</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-colors"
            disabled={loading}
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handlePayment}
            className="flex-1 px-4 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '⏳ Verwerking...' : '✓ Betalen'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          💡 Bij succesvole betaling ben je ingeschreven voor deze speeldag
        </p>
      </div>
    </Modal>
  );
}
