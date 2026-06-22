import React from 'react';

const ProfileSection: React.FC<{
  user: any;
  onEdit: () => void;
}> = ({ user, onEdit }) => {
  if (!user) return null;
  return (
    <section className="bg-blue-50 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user.member?.profilePhotoUrl || '/default-profile.png'}
          alt={user.member?.firstName && user.member?.lastName ? `Profielfoto van ${user.member.firstName} ${user.member.lastName}` : 'Profielfoto'}
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
        />
        <div>
          <h2 className="text-xl font-bold">{user.member?.firstName} {user.member?.lastName}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <button
          onClick={onEdit}
          className="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          aria-label="Open profiel bewerken dialoog"
          type="button"
        >
          <span className="material-icons text-base" aria-hidden="true">edit</span>
          <span>Gegevens wijzigen</span>
        </button>
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-gray-500">Telefoonnummer</dt>
          <dd>
            {user.member?.phone ? (
              <a href={`tel:${user.member.phone}`} className="text-blue-700 underline">{user.member.phone}</a>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Voorkeuren</dt>
          <dd>{user.member?.playPreferences ? JSON.stringify(user.member.playPreferences) : <span className="text-gray-400">-</span>}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Speelniveau</dt>
          <dd>{user.member?.skillLevel || <span className="text-gray-400">-</span>}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Privacy</dt>
          <dd>
            {user.member?.privacy ? 'Zichtbaar in ranking' : 'Niet zichtbaar'}
            <div className="text-xs text-gray-400 mt-1">Je privacy-instelling bepaalt of je zichtbaar bent in de ledenlijst en ranking.</div>
          </dd>
        </div>
      </dl>
    </section>
  );
};

export default ProfileSection;
