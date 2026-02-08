import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Sponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  createdAt: string;
}

const SponsorsManagement: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    contactEmail: "",
  });

  // Load sponsors from localStorage (placeholder until API is ready)
  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = () => {
    try {
      const saved = localStorage.getItem("sponsors");
      if (saved) {
        setSponsors(JSON.parse(saved));
        return;
      }

      const savedV2 = localStorage.getItem("ap-sponsors");
      if (savedV2) {
        const parsed = JSON.parse(savedV2) as { sponsors?: Sponsor[] };
        if (Array.isArray(parsed?.sponsors)) {
          setSponsors(parsed.sponsors);
        }
      }
    } catch (error) {
      console.error("Failed to load sponsors:", error);
    }
  };

  const saveSponsors = (updatedSponsors: Sponsor[]) => {
    try {
      localStorage.setItem("sponsors", JSON.stringify(updatedSponsors));
      localStorage.setItem(
        "ap-sponsors",
        JSON.stringify({ sponsors: updatedSponsors, updatedAt: Date.now() }),
      );
      setSponsors(updatedSponsors);
      window.dispatchEvent(new Event("sponsors:updated"));
    } catch (error) {
      console.error("Failed to save sponsors:", error);
      toast.error("Fout bij opslaan sponsors");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      logo: "",
      website: "",
      contactEmail: "",
    });
    setEditingId(null);
  };

  const handleOpenModal = (sponsor?: Sponsor) => {
    if (sponsor) {
      setFormData({
        name: sponsor.name,
        logo: sponsor.logo || "",
        website: sponsor.website || "",
        contactEmail: sponsor.contactEmail || "",
      });
      setEditingId(sponsor.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Sponsor naam is verplicht");
      return;
    }

    setIsLoading(true);

    try {
      let updatedSponsors: Sponsor[];

      if (editingId) {
        // Update existing sponsor
        updatedSponsors = sponsors.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formData.name,
                logo: formData.logo,
                website: formData.website,
                contactEmail: formData.contactEmail,
              }
            : s,
        );
        toast.success("Sponsor bijgewerkt");
      } else {
        // Add new sponsor
        const newSponsor: Sponsor = {
          id: Date.now().toString(),
          name: formData.name,
          logo: formData.logo,
          website: formData.website,
          contactEmail: formData.contactEmail,
          createdAt: new Date().toISOString(),
        };
        updatedSponsors = [...sponsors, newSponsor];
        toast.success("Sponsor toegevoegd");
      }

      saveSponsors(updatedSponsors);
      handleCloseModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Weet je zeker dat je deze sponsor wilt verwijderen?")) {
      const updatedSponsors = sponsors.filter((s) => s.id !== id);
      saveSponsors(updatedSponsors);
      toast.success("Sponsor verwijderd");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Sponsor Beheer</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-ap-blue-600 text-white rounded-lg hover:bg-ap-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Nieuwe Sponsor
        </button>
      </div>

      {/* Sponsors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sponsors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nog geen sponsors toegevoegd</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Naam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sponsors.map((sponsor) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {sponsor.logo && (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="w-10 h-10 object-contain"
                          />
                        )}
                        <span className="font-medium text-gray-900">
                          {sponsor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sponsor.website ? (
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {sponsor.website}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {sponsor.contactEmail || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleOpenModal(sponsor)}
                        className="text-ap-blue-600 hover:text-ap-blue-700 inline-flex items-center gap-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Wijzig
                      </button>
                      <button
                        onClick={() => handleDelete(sponsor.id)}
                        className="text-ap-red-600 hover:text-ap-red-700 inline-flex items-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Verwijder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "Sponsor wijzigen" : "Nieuwe sponsor"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sponsor naam *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ap-blue-500"
                  placeholder="Bijv. ABC Bedrijven"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ap-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ap-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact e-mail
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ap-blue-500"
                  placeholder="contact@sponsor.nl"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-ap-yellow-500 text-ap-black rounded-lg hover:bg-ap-yellow-600 disabled:opacity-50 transition"
                >
                  {isLoading ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorsManagement;
