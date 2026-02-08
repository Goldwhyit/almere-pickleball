import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { photosApi } from "../lib/photosApi";

interface Photo {
  id: string;
  title: string;
  alt: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AdminPhotos = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    alt: "",
    imageUrl: "",
  });

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await photosApi.getAllAdmin();
      setPhotos(data);
    } catch (err) {
      setError("Fout bij laden van foto's");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ title: "", alt: "", imageUrl: "" });
  };

  const handleEdit = (photo: Photo) => {
    setEditingId(photo.id);
    setIsAdding(false);
    setFormData({
      title: photo.title,
      alt: photo.alt,
      imageUrl: photo.imageUrl,
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: "", alt: "", imageUrl: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isAdding) {
        await photosApi.create(formData);
        setSuccess("Foto toegevoegd!");
      } else if (editingId) {
        await photosApi.update(editingId, formData);
        setSuccess("Foto bijgewerkt!");
      }
      await loadPhotos();
      handleCancel();
    } catch (err: any) {
      setError(err.response?.data?.message || "Fout bij opslaan");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Zeker weten dat je deze foto wilt verwijderen?")) return;

    try {
      setError("");
      await photosApi.delete(id);
      setSuccess("Foto verwijderd!");
      await loadPhotos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Fout bij verwijderen");
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      setError("");
      await photosApi.toggleActive(id);
      await loadPhotos();
      setSuccess("Status bijgewerkt!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Fout bij bijwerken");
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const result = await photosApi.upload(file);
      setFormData({ ...formData, imageUrl: result.imageUrl });
      setSuccess("Upload gelukt! URL is ingevuld.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Fout bij uploaden");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="bg-white hover:bg-ap-blue-50 text-ap-black font-semibold px-4 py-2 rounded-lg border border-ap-blue-200"
          >
            ← Terug naar dashboard
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Fotosectie Beheren
          </h2>
        </div>
        <button
          onClick={handleAdd}
          className="bg-ap-yellow-500 hover:bg-ap-yellow-600 text-ap-black font-semibold px-4 py-2 rounded-lg"
        >
          + Foto Toevoegen
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Fout: {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Form */}
      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? "Nieuwe Foto" : "Foto Bewerken"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text (voor SEO)
              </label>
              <input
                type="text"
                value={formData.alt}
                onChange={(e) =>
                  setFormData({ ...formData, alt: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Foto (van computer)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB. JPG, PNG, WEBP.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Afbeeldings URL (of via upload)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://..."
                required
              />
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="mt-2 max-h-40 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Opslaan
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Photos List */}
      <div className="grid gap-4">
        {photos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Geen foto's beschikbaar
          </p>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={photo.imageUrl}
                  alt={photo.alt}
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/80";
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{photo.title}</h3>
                  <p className="text-sm text-gray-600">{photo.alt}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Volgorde: {photo.order} • Status:{" "}
                    {photo.isActive ? "✓ Actief" : "✗ Inactief"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(photo.id)}
                  className={`px-3 py-2 rounded font-semibold text-white text-sm ${
                    photo.isActive
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  {photo.isActive ? "Actief" : "Inactief"}
                </button>
                <button
                  onClick={() => handleEdit(photo)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm"
                >
                  Bewerk
                </button>
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-sm"
                >
                  Verwijder
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
