import React, { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  membershipStatus?: string;
  createdAt: string;
}

const MembersTable: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await adminApi.getMembers();
        setMembers(response.data || response);
      } catch (error) {
        console.error("Failed to load members:", error);
        // Silently fail - show empty members list
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      `${m.firstName} ${m.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Laden...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leden</h2>
        <input
          type="text"
          placeholder="Zoek op naam of e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        />
      </div>

      {filteredMembers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Naam</th>
                <th className="px-4 py-2 border-b">E-mail</th>
                <th className="px-4 py-2 border-b">Telefoon</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Lid sinds</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {m.firstName} {m.lastName}
                  </td>
                  <td className="px-4 py-2">{m.email}</td>
                  <td className="px-4 py-2">{m.phone || "-"}</td>
                  <td className="px-4 py-2">{m.membershipStatus}</td>
                  <td className="px-4 py-2">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Geen leden gevonden met de huidige filters.
        </div>
      )}
    </div>
  );
};

export default MembersTable;
