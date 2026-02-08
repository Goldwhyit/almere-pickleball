import React from 'react';

interface StatusBadgeProps {
  type: 'trial' | 'membership' | 'payment' | 'role';
  value: string | boolean;
  className?: string;
}

// Mapping: type + value → kleur + label
const getBadgeConfig = (type: StatusBadgeProps['type'], value: string | boolean) => {
  switch (type) {
    case 'trial':
      if (value === true || value === 'TRIAL') return { color: 'bg-yellow-100 text-yellow-800', label: 'Trial actief' };
      if (value === false || value === 'TRIAL_EXPIRED') return { color: 'bg-gray-100 text-gray-800', label: 'Trial verlopen' };
      return { color: 'bg-gray-100 text-gray-800', label: typeof value === 'string' ? value : '-' };
    case 'membership':
      if (value === 'APPROVED') return { color: 'bg-green-100 text-green-800', label: 'Goedgekeurd' };
      if (value === 'PENDING') return { color: 'bg-yellow-100 text-yellow-800', label: 'In afwachting' };
      return { color: 'bg-gray-100 text-gray-800', label: typeof value === 'string' ? value : '-' };
    case 'payment':
      if (value === 'PAID') return { color: 'bg-green-100 text-green-800', label: 'Betaald' };
      if (value === 'UNPAID') return { color: 'bg-red-100 text-red-800', label: 'Onbetaald' };
      return { color: 'bg-gray-100 text-gray-800', label: typeof value === 'string' ? value : '-' };
    case 'role':
      if (value === 'ADMIN') return { color: 'bg-indigo-100 text-indigo-800', label: 'Admin' };
      if (value === 'MEMBER') return { color: 'bg-gray-100 text-gray-800', label: 'Lid' };
      return { color: 'bg-gray-100 text-gray-800', label: typeof value === 'string' ? value : '-' };
    default:
      return { color: 'bg-gray-100 text-gray-800', label: '-' };
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className = '' }) => {
  const { color, label } = getBadgeConfig(type, value);
  // Vaste breedte voor layout stabiliteit
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color} min-w-[90px] text-center ${className}`}
      aria-label={label}
      role="status"
    >
      {label}
    </span>
  );
};

export default StatusBadge;

// Voorbeeldgebruik:
/*
<StatusBadge type="trial" value={member.trialStatus} />
<StatusBadge type="membership" value={member.membershipStatus} />
<StatusBadge type="payment" value={member.paymentStatus} />
<StatusBadge type="role" value={member.role} />
*/
