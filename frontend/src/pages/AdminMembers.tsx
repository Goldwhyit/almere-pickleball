import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  membershipType?: string;
  membershipStatus: string;
  paymentStatus: string;
  role?: "ADMIN" | "MEMBER";
  punchCardCount?: number;
  credit?: number;
  membershipStartDate?: string;
  membershipExpiryDate?: string;
  createdAt?: string;
}

export const AdminMembers = () => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentMemberId = useAuthStore((s) => s.user?.member?.id);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Member>>({});

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    fetchMembers();
  }, [accessToken, navigate]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:3000/api/admin/members",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setMembers(data || []);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Fout bij ophalen leden");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm("Weet je zeker dat je dit lid wilt verwijderen?"))
      return;
    try {
      await axios.delete(
        `http://localhost:3000/api/admin/members/${memberId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err: any) {
      setError("Fout bij verwijderen lid");
    }
  };

  const handleToggleAdmin = async (member: Member) => {
    const makeAdmin = member.role !== "ADMIN";
    const confirmMessage = makeAdmin
      ? `Weet je zeker dat je ${member.firstName} ${member.lastName} admin wilt maken?`
      : `Weet je zeker dat je ${member.firstName} ${member.lastName} terug lid wilt maken?`;
    if (!window.confirm(confirmMessage)) return;
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/admin/members/${member.id}/toggle-admin`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setMembers(
        members.map((m) => (m.id === member.id ? { ...m, ...data } : m)),
      );
      setError("");
    } catch (err: any) {
      setError("Fout bij wijzigen admin status");
    }
  };

  const handleRoleChange = async (
    member: Member,
    nextRole: "ADMIN" | "MEMBER",
  ) => {
    if (member.id === currentMemberId && nextRole === "MEMBER") {
      setError("Je kunt jezelf niet downgraden van admin naar lid");
      return;
    }
    if (member.role === nextRole) return;
    const confirmMessage =
      nextRole === "ADMIN"
        ? `Weet je zeker dat je ${member.firstName} ${member.lastName} admin wilt maken?`
        : `Weet je zeker dat je ${member.firstName} ${member.lastName} terug lid wilt maken?`;
    if (!window.confirm(confirmMessage)) return;
    await handleToggleAdmin(member);
    await fetchMembers();
  };

  const handleStatusChange = async (
    member: Member,
    nextStatus: "PENDING" | "APPROVED",
  ) => {
    if (member.membershipStatus === nextStatus) return;
    const confirmMessage =
      nextStatus === "APPROVED"
        ? `Weet je zeker dat je ${member.firstName} ${member.lastName} wilt goedkeuren?`
        : `Weet je zeker dat je ${member.firstName} ${member.lastName} terug op in afwachting wilt zetten?`;
    if (!window.confirm(confirmMessage)) return;
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/admin/members/${member.id}/membership-status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setMembers(
        members.map((m) => (m.id === member.id ? { ...m, ...data } : m)),
      );
      await fetchMembers();
      setError("");
    } catch (err: any) {
      setError("Fout bij wijzigen status");
    }
  };

  const handlePaymentChange = async (
    member: Member,
    nextStatus: "PAID" | "UNPAID" | "PENDING" | "OVERDUE",
  ) => {
    if (member.paymentStatus === nextStatus) return;
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/admin/members/${member.id}`,
        { paymentStatus: nextStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setMembers(
        members.map((m) => (m.id === member.id ? { ...m, ...data } : m)),
      );
      await fetchMembers();
      setError("");
    } catch (err: any) {
      setError("Fout bij wijzigen betaling");
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
    setEditFormData(member);
  };

  const handleEditSave = async () => {
    if (!editingMember) return;
    try {
      await axios.put(
        `http://localhost:3000/api/admin/members/${editingMember.id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setMembers(
        members.map((m) =>
          m.id === editingMember.id ? { ...m, ...editFormData } : m,
        ),
      );
      setEditingMember(null);
      setError("");
    } catch (err: any) {
      setError("Fout bij opslaan lid");
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      `${m.firstName} ${m.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || m.membershipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-ap-light">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="text-ap-blue-600 hover:text-ap-blue-700 mb-4 flex items-center gap-2"
          >
            ← Terug naar Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Ledenlijst Beheer
          </h1>
          <p className="text-gray-600 mt-2">Totaal leden: {members.length}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-ap-sm flex gap-4 flex-wrap">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zoeken
            </label>
            <input
              type="text"
              placeholder="Naam of email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ap-blue-500"
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ap-blue-500"
            >
              <option value="">Alle statussen</option>
              <option value="PENDING">In Afwachting</option>
              <option value="APPROVED">Goedgekeurd</option>
            </select>
          </div>
          <button
            onClick={fetchMembers}
            className="px-4 py-2 bg-ap-blue-600 hover:bg-ap-blue-700 text-white rounded-lg self-end"
          >
            Vernieuwen
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        )}

        {/* Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-ap-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ap-light border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Naam
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Telefoon
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Betaling
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {member.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={member.membershipStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            member,
                            e.target.value as "PENDING" | "APPROVED",
                          )
                        }
                        className={`px-2 py-1 rounded text-xs font-semibold border ${
                          member.membershipStatus === "APPROVED"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }`}
                      >
                        <option value="PENDING">In Afwachting</option>
                        <option value="APPROVED">Goedgekeurd</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={member.paymentStatus}
                        onChange={(e) =>
                          handlePaymentChange(
                            member,
                            e.target.value as
                              | "PAID"
                              | "UNPAID"
                              | "PENDING"
                              | "OVERDUE",
                          )
                        }
                        className={`px-2 py-1 rounded text-xs font-semibold border ${
                          member.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        <option value="PAID">Betaald</option>
                        <option value="UNPAID">Niet betaald</option>
                        <option value="PENDING">In afwachting</option>
                        <option value="OVERDUE">Achterstallig</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={member.role || "MEMBER"}
                        onChange={(e) =>
                          handleRoleChange(
                            member,
                            e.target.value as "ADMIN" | "MEMBER",
                          )
                        }
                        disabled={member.id === currentMemberId}
                        className={`px-2 py-1 rounded text-xs font-semibold border ${
                          member.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        } ${member.id === currentMemberId ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <option value="MEMBER">Lid</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <button
                        onClick={() => handleEditClick(member)}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        ✏️ Bewerken
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-red-600 hover:text-red-700 font-semibold"
                      >
                        🗑️ Verwijderen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMembers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Geen leden gevonden
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Lid Bewerken
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Persoonsgegevens */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voornaam
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Achternaam
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lidmaatschapsstatus
                  </label>
                  <select
                    value={editFormData.membershipStatus || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        membershipStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">In Afwachting</option>
                    <option value="APPROVED">Goedgekeurd</option>
                    <option value="REJECTED">Geweigerd</option>
                  </select>
                </div>

                {/* Lidmaatschaptype */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lidmaatschaptype
                  </label>
                  <select
                    value={editFormData.membershipType || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        membershipType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Geen</option>
                    <option value="YEARLY_UPFRONT">Jaarlijks (Vooraf)</option>
                    <option value="YEARLY">Jaarlijks</option>
                    <option value="MONTHLY">Maandelijks</option>
                    <option value="PER_SESSION">Per Sessie</option>
                    <option value="PUNCH_CARD">Strippenkaart</option>
                  </select>
                </div>

                {/* Betaalstatus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Betaalstatus
                  </label>
                  <select
                    value={editFormData.paymentStatus || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        paymentStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PAID">Betaald</option>
                    <option value="UNPAID">Niet betaald</option>
                    <option value="OVERDUE">Achterstallig</option>
                    <option value="PENDING">In afwachting</option>
                  </select>
                </div>

                {/* Krediet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Krediet (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.credit || 0}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        credit: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Strippenkaart */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strippen Resterend
                  </label>
                  <input
                    type="number"
                    value={editFormData.punchCardCount || 0}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        punchCardCount: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Lidmaatschap startdatum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lidmaatschap Start
                  </label>
                  <input
                    type="date"
                    value={
                      editFormData.membershipStartDate
                        ? new Date(editFormData.membershipStartDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        membershipStartDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Lidmaatschap vervaldatum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lidmaatschap Vervaldatum
                  </label>
                  <input
                    type="date"
                    value={
                      editFormData.membershipExpiryDate
                        ? new Date(editFormData.membershipExpiryDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        membershipExpiryDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingMember(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
