import { useState } from 'react';
import Modal from './Modal';
import axios from 'axios';

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  membershipPlan: string;
  onSuccess: () => void;
}

const MEMBERSHIP_PRICES: Record<string, number> = {
  YEARLY: 250.00,
  MONTHLY: 25.00,
  PER_SESSION: 8.50
};

const MEMBERSHIP_LABELS: Record<string, string> = {
  YEARLY: 'Jaarlidmaatschap',
  MONTHLY: 'Maandlidmaatschap',
  PER_SESSION: 'Per sessie'
};

const API_BASE_URL = ((import.meta.env.VITE_API_URL as string | undefined)?.trim() || (typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api')).replace(/\/$/, '');

export default function MembershipPaymentModal({ 
  isOpen, 
  onClose, 
  membershipPlan,
  onSuccess 
}: MembershipPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = MEMBERSHIP_PRICES[membershipPlan] || 0;
  const planLabel = MEMBERSHIP_LABELS[membershipPlan] || membershipPlan;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      // Create a mock payment (in production, integrate with actual payment provider)
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Complete payment and convert to member
      await axios.post(
        `${API_BASE_URL}/trial-lessons/complete-payment`,
        { paymentId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Betaling mislukt. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Lidmaatschap Betaling">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Gekozen lidmaatschap</h3>
          <p className="text-2xl font-bold text-blue-700">{planLabel}</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            €{amount.toFixed(2)}
            {membershipPlan === 'MONTHLY' && <span className="text-lg"> / maand</span>}
            {membershipPlan === 'YEARLY' && <span className="text-lg"> / jaar</span>}
            {membershipPlan === 'PER_SESSION' && <span className="text-lg"> / sessie</span>}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Wat krijg je:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {membershipPlan === 'YEARLY' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Onbeperkt toegang tot alle speeldagen (hele jaar)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Gratis deelname aan club toernooien</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Beste prijs-kwaliteit verhouding</span>
                </li>
              </>
            )}
            {membershipPlan === 'MONTHLY' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Onbeperkt toegang tot alle speeldagen (maandelijks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Gratis deelname aan club toernooien</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Flexibel opzegbaar</span>
                </li>
              </>
            )}
            {membershipPlan === 'PER_SESSION' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Betaal per speelsessie</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Geen verplichtingen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Ideaal voor occasionele spelers</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="mb-2">
            <strong>Let op:</strong> Dit is een testomgeving. In productie wordt dit geïntegreerd met een echte betaalprovider (bijv. Mollie, Stripe).
          </p>
          <p>
            Na voltooiing van de betaling wordt je account direct geactiveerd.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-gray-300 hover:bg-gray-50"
            disabled={loading}
          >
            Annuleren
          </button>
          <button
            onClick={handlePayment}
            className="flex-1 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-semibold"
            disabled={loading}
          >
            {loading ? 'Bezig met betalen...' : `Betaal €${amount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
