// Types voor admin dashboard

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  membershipType?: string;
  membershipStatus: 'PENDING' | 'APPROVED';
  paymentStatus: 'PAID' | 'UNPAID';
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
};

export type PlayDay = {
  id: string;
  date: string;
  time: string;
  location: string;
  registrations: Array<{
    memberId: string;
    name: string;
    membershipType: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  totalMembers: number;
  pendingMembers: number;
  openPayments: number;
  playDays: number;
};
