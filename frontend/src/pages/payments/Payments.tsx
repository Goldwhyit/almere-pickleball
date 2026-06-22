import { useEffect, useState } from 'react';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../../lib/paymentApi';
import { memberAPI } from '../../lib/memberApi';

const emptyPayment = {
  memberId: '',
  tournamentId: '',
  amount: '',
  currency: 'EUR',
  status: 'PENDING',
  paymentMethod: '',
  transactionId: '',
  paymentDate: '',
};

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyPayment);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = () => {
    setLoading(true);
    getPayments()
      .then((res) => setPayments(res.data))
      .catch(() => setError('Kan payments niet ophalen'))
      .finally(() => setLoading(false));
  };

  const fetchMembers = () => {
    memberAPI.getMembers()
      .then((res) => setMembers(res))
      .catch(() => setError('Kan leden niet ophalen'));
  };

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const action = editingId ? updatePayment(editingId, form) : createPayment(form);
    action
      .then(() => {
        setForm(emptyPayment);
        setEditingId(null);
        fetchPayments();
      })
      .catch(() => setError('Opslaan mislukt'))
      .finally(() => setLoading(false));
  };

  const handleEdit = (payment: any) => {
    setForm({ ...payment, paymentDate: payment.paymentDate ? payment.paymentDate.slice(0, 16) : '' });
    setEditingId(payment.id);
  };

  const handleDelete = (id: string) => {
    setLoading(true);
    deletePayment(id)
      .then(fetchPayments)
      .catch(() => setError('Verwijderen mislukt'))
      .finally(() => setLoading(false));
  };

  const getMemberName = (id: string) => {
    const m = members.find((mem) => mem.id === id);
    return m ? `${m.firstName} ${m.lastName}` : id;
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-2">
        <select name="memberId" value={form.memberId} onChange={handleChange} className="border p-1" required>
          <option value="">Lid</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
          ))}
        </select>
        <input name="tournamentId" value={form.tournamentId} onChange={handleChange} placeholder="Tournament ID" className="border p-1" required />
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="Bedrag" type="number" step="0.01" className="border p-1" required />
        <input name="currency" value={form.currency} onChange={handleChange} placeholder="Valuta" className="border p-1" />
        <select name="status" value={form.status} onChange={handleChange} className="border p-1">
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        <input name="paymentMethod" value={form.paymentMethod} onChange={handleChange} placeholder="Methode" className="border p-1" />
        <input name="transactionId" value={form.transactionId} onChange={handleChange} placeholder="Transactie ID" className="border p-1" />
        <input name="paymentDate" value={form.paymentDate} onChange={handleChange} placeholder="Betaaldatum" type="datetime-local" className="border p-1" />
        <button type="submit" className="col-span-2 bg-primary-600 text-white py-2 rounded">
          {editingId ? 'Update' : 'Aanmaken'}
        </button>
      </form>
      {loading ? (
        <div>Laden...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Lid</th>
              <th>Toernooi</th>
              <th>Bedrag</th>
              <th>Status</th>
              <th>Methode</th>
              <th>Datum</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t">
                <td>{getMemberName(p.memberId)}</td>
                <td>{p.tournamentId}</td>
                <td>{p.amount} {p.currency}</td>
                <td>{p.status}</td>
                <td>{p.paymentMethod}</td>
                <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : ''}</td>
                <td>
                  <button onClick={() => handleEdit(p)} className="text-blue-600 mr-2">Bewerk</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">Verwijder</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Payments;
