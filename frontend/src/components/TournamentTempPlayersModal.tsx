import { useState } from 'react';

interface TempPlayer {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  level?: string;
  duprRating?: string;
}

interface TournamentTempPlayersModalProps {
  tournament: any;
  enrolledCount: number;
  onSave: (tempPlayers: TempPlayer[]) => Promise<void>;
  onClose: () => void;
}

export default function TournamentTempPlayersModal({
  tournament,
  enrolledCount,
  onSave,
  onClose,
}: TournamentTempPlayersModalProps) {
  const [tempPlayers, setTempPlayers] = useState<TempPlayer[]>(
    tournament?.temporaryPlayers || []
  );
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'mixed',
    level: 'intermediate',
    duprRating: '3.0',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const maxParticipants = tournament?.maxParticipants || 0;
  const remainingSpots = maxParticipants - enrolledCount - tempPlayers.length;
  const canAddMore = remainingSpots > 0;

  const handleAddOrUpdate = () => {
    if (!formData.name.trim()) {
      alert('Naam is verplicht');
      return;
    }

    if (!canAddMore && !editingId) {
      alert('Geen vrije plekken meer beschikbaar');
      return;
    }

    if (editingId) {
      setTempPlayers(
        tempPlayers.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: formData.name,
                age: formData.age ? parseInt(formData.age) : undefined,
                gender: formData.gender,
                level: formData.level,
                duprRating: formData.duprRating,
              }
            : p
        )
      );
      setEditingId(null);
    } else {
      const newPlayer: TempPlayer = {
        id: `TEMP_${Date.now()}`,
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        level: formData.level,
        duprRating: formData.duprRating,
      };
      setTempPlayers([...tempPlayers, newPlayer]);
    }

    setFormData({
      name: '',
      age: '',
      gender: 'mixed',
      level: 'intermediate',
      duprRating: '3.0',
    });
  };

  const handleEdit = (player: TempPlayer) => {
    setFormData({
      name: player.name,
      age: player.age ? String(player.age) : '',
      gender: player.gender || 'mixed',
      level: player.level || 'intermediate',
      duprRating: player.duprRating || '3.0',
    });
    setEditingId(player.id);
  };

  const handleDelete = (id: string) => {
    setTempPlayers(tempPlayers.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setFormData({
        name: '',
        age: '',
        gender: 'mixed',
        level: 'intermediate',
        duprRating: '3.0',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(tempPlayers);
      alert('Tijdelijke spelers opgeslagen');
      onClose();
    } catch (error) {
      console.error('Error saving temporary players:', error);
      alert('Fout bij opslaan van tijdelijke spelers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with stats */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Tijdelijke Spelers Toevoegen</h2>
              <p className="text-blue-100 mt-1">Beheer gastspelers voor het toernooi</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="bg-blue-500 bg-opacity-50 rounded-lg p-3">
              <div className="text-sm opacity-90">Ingeschreven Leden</div>
              <div className="text-2xl font-bold">{enrolledCount}</div>
            </div>
            <div className="bg-blue-500 bg-opacity-50 rounded-lg p-3">
              <div className="text-sm opacity-90">Tijdelijke Spelers</div>
              <div className="text-2xl font-bold">{tempPlayers.length}</div>
            </div>
            <div
              className={`${
                remainingSpots > 0 ? 'bg-green-500' : 'bg-red-500'
              } bg-opacity-50 rounded-lg p-3`}
            >
              <div className="text-sm opacity-90">Vrije Plekken</div>
              <div className="text-2xl font-bold">
                {Math.max(0, remainingSpots)}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm bg-blue-500 bg-opacity-30 rounded-lg p-2">
            Totaal toernooi: <strong>{maxParticipants}</strong> spelers |
            Ingeschreven totaal:{' '}
            <strong>{enrolledCount + tempPlayers.length}</strong>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add/Edit Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Speler Bewerken' : 'Nieuwe Speler Toevoegen'}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Naam *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Volledige naam"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!canAddMore && !editingId}
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Leeftijd
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    placeholder="Leeftijd"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Geslacht
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Man</option>
                    <option value="female">Vrouw</option>
                    <option value="mixed">Gemengd</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Niveau
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    DUPR Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.duprRating}
                    onChange={(e) =>
                      setFormData({ ...formData, duprRating: e.target.value })
                    }
                    placeholder="3.0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddOrUpdate}
                disabled={!canAddMore && !editingId}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {editingId ? 'Opslaan' : 'Toevoegen'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: '',
                      age: '',
                      gender: 'mixed',
                      level: 'intermediate',
                      duprRating: '3.0',
                    });
                  }}
                  className="flex-1 bg-gray-400 text-white rounded-lg px-4 py-2 hover:bg-gray-500 transition"
                >
                  Annuleren
                </button>
              )}
            </div>
          </div>

          {/* Players List */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Toegevoegde Spelers ({tempPlayers.length})
            </h3>

            {tempPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nog geen tijdelijke spelers toegevoegd
              </div>
            ) : (
              <div className="space-y-2">
                {tempPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-gray-50 rounded-lg p-3 flex justify-between items-start border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {player.age && <span>Leeftijd: {player.age} • </span>}
                        {player.gender && (
                          <span>
                            Geslacht:{' '}
                            {player.gender === 'male'
                              ? 'Man'
                              : player.gender === 'female'
                              ? 'Vrouw'
                              : 'Gemengd'}{' '}
                            •{' '}
                          </span>
                        )}
                        {player.level && <span>Niveau: {player.level} </span>}
                        {player.duprRating && (
                          <span>• DUPR: {player.duprRating}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(player)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition"
                      >
                        Bewerk
                      </button>
                      <button
                        onClick={() => handleDelete(player.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition"
                      >
                        Verwijder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}
