import { useState, type FC, type ChangeEvent, type FormEvent } from 'react';

const ProfileEditModal: FC<{
  user: any;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ user, open, onClose, onSave }) => {
  const [form, setForm] = useState({
    firstName: user?.member?.firstName || '',
    lastName: user?.member?.lastName || '',
    phone: user?.member?.phone || '',
    skillLevel: user?.member?.skillLevel || '',
    profilePhotoUrl: user?.member?.profilePhotoUrl || '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Only send these fields - nothing else!
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      skillLevel: form.skillLevel,
      profilePhotoUrl: form.profilePhotoUrl,
    };
    
    onSave(payload);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">✕</button>
        <h2 className="text-xl font-bold mb-4">Profielgegevens wijzigen</h2>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="flex flex-col items-center gap-2 mb-2">
            <img
              src={form.profilePhotoUrl || '/default-profile.png'}
              alt="Profielfoto preview"
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-200"
            />
          </div>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Voornaam" className="border p-2 rounded" required />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Achternaam" className="border p-2 rounded" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefoonnummer" className="border p-2 rounded" />
          <select name="skillLevel" value={form.skillLevel} onChange={handleChange} className="border p-2 rounded">
            <option value="">Speelniveau</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button type="submit" className="bg-primary-600 text-white py-2 rounded mt-2">Opslaan</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
