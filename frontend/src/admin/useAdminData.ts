import React from 'react';
import { useState, useCallback } from 'react';
import { useAuthStore } from '../stores/auth';
import { trialApi } from '../lib/api';

// Types
export type AdminMember = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType?: string;
  membershipStatus?: string;
  paymentStatus?: string;
  role?: string;
  // Trial info
  trialStatus?: string;
  trialLessonsUsed?: number;
  trialStartDate?: string;
  trialEndDate?: string;
  isTrialExpired?: boolean;
  conversionDate?: string;
};

export type AdminStats = {
  totalMembers: number;
  pendingMembers: number;
  openPayments: number;
  upcomingPlaydays: number;
  totalTrialMembers: number;
  trialExpired: number;
  convertedToMember: number;
};

export type UseAdminDataResult = {
  data: AdminMember[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useAdminData(): UseAdminDataResult {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [data, setData] = useState<AdminMember[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all endpoints in parallel
      const [membersRes, trialMembersRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/members', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then((r) => {
          if (!r.ok) throw new Error('Fout bij ophalen leden');
          return r.json();
        }),
        trialApi.getAllTrialMembers().then((r) => r.data.data || []),
        trialApi.getTrialStats().then((r) => r.data || {}),
      ]);

      // Combine members and trialMembers per user
      const merged = membersRes.map((member: any) => {
        // Match trial info by id or userId
        const trial = trialMembersRes.find(
          (t: any) => t.id === member.id || t.userId === member.userId
        );
        return {
          ...member,
          trialStatus: trial?.accountType || null,
          trialLessonsUsed: trial?.trialLessonsUsed,
          trialStartDate: trial?.trialStartDate,
          trialEndDate: trial?.trialEndDate,
          isTrialExpired: trial?.isTrialExpired,
          conversionDate: trial?.conversionDate,
        };
      });

      setData(merged);
      setStats(statsRes);
    } catch (err: any) {
      setError('Fout bij laden van admin data');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Initial fetch
  // Stable initial state: geen undefined flashes
  React.useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return {
    data,
    stats,
    loading,
    error,
    refetch: fetchAll,
  };
}
