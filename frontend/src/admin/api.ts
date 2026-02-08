// API helpers voor admin dashboard
import { Member, PlayDay, DashboardStats } from './types';

export async function fetchMembers(): Promise<Member[]> {
  const token = localStorage.getItem('accessToken');
  const res = await fetch('/api/admin/members', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Leden ophalen mislukt');
  return res.json();
}

export async function fetchPlayDays(): Promise<PlayDay[]> {
  const token = localStorage.getItem('accessToken');
  const res = await fetch('/api/admin/playdays', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Speeldagen ophalen mislukt');
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = localStorage.getItem('accessToken');
  const res = await fetch('/api/admin/dashboard-overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Statistieken ophalen mislukt');
  return res.json();
}

// ...andere CRUD helpers voor leden en speeldagen
