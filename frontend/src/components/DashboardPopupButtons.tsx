import { useState } from 'react';
import Modal from '../components/Modal';
import Matches from '../pages/matches/Matches';
import MembersDashboard from '../pages/MembersDashboard';
import Tournaments from '../pages/tournaments/Tournaments';
import CourtsDashboard from '../pages/CourtsDashboard';
import { useAuthStore } from '../stores/authStore';

const dashboardInfo = {
  matches: {
    title: 'Matches Dashboard',
    content: <Matches />
  },
  members: {
    title: 'Members Dashboard',
    content: <MembersDashboard />
  },
  tournaments: {
    title: 'Tournaments Dashboard',
    content: <Tournaments />
  },
  courts: {
    title: 'Courts Dashboard',
    content: <CourtsDashboard />
  }
};

export default function DashboardPopupButtons() {
  const { user } = useAuthStore();
  const [modal, setModal] = useState<null | keyof typeof dashboardInfo>(null);
  
  // Alleen tonen voor ADMIN of ORGANIZER
  const isAdminOrOrganizer = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';
  
  if (!isAdminOrOrganizer) {
    return null;
  }
  
  const navItems = [
    { key: 'matches', label: 'Matches Dashboard' },
    { key: 'members', label: 'Members Dashboard' },
    { key: 'tournaments', label: 'Tournaments Dashboard' },
    { key: 'courts', label: 'Courts Dashboard' },
  ];
  return (
    <nav aria-label="Dashboard navigatie" className="max-w-3xl mx-auto py-10 px-4">
      <ul className="flex flex-wrap justify-center gap-4 md:gap-8">
        {navItems.map(item => (
          <li key={item.key}>
            <a
              href="#"
              onClick={e => { e.preventDefault(); setModal(item.key as keyof typeof dashboardInfo); }}
              aria-current={modal === item.key ? 'page' : undefined}
              className={
                `px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 ` +
                (modal === item.key
                  ? 'bg-primary-700 text-white underline underline-offset-4 shadow-xl'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200')
              }
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <Modal open={!!modal} title={modal ? dashboardInfo[modal].title : ''} onClose={() => setModal(null)} size={modal === 'matches' ? 'lg' : 'md'}>
        <div className="mb-4">{modal && dashboardInfo[modal].content}</div>
      </Modal>
    </nav>
  );
}
