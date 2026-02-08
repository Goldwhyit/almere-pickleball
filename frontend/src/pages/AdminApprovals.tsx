import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

interface PendingMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  createdAt?: string;
}

export const AdminApprovals = () => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    fetchPendingMembers();
  }, [accessToken, navigate]);

  const fetchPendingMembers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:3000/api/admin/members",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const pending = data.filter((m: any) => m.membershipStatus === "PENDING");
      setMembers(pending);
      setError("");
    } catch (err: any) {
      setError("Fout bij ophalen leden");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: string) => {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/members/${memberId}`,
        { membershipStatus: "APPROVED" },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err: any) {
      setError("Fout bij goedkeuren lid");
    }
  };

  const handleReject = async (memberId: string) => {
    if (!window.confirm("Weet je zeker dat je dit lid wilt afwijzen?")) return;
    try {
      await axios.put(
        `http://localhost:3000/api/admin/members/${memberId}`,
        { membershipStatus: "REJECTED" },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err: any) {
      setError("Fout bij afwijzen lid");
    }
  };

  return (
    <div className="min-h-screen bg-ap-light">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <button
          onClick={() => navigate("/admin")}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Terug naar Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Leden Goedkeuringen
        </h1>
        <p className="text-gray-600 mb-8">In afwachting: {members.length}</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-12 text-gray-500">Laden...</div>
        )}

        {!loading && members.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-ap-sm">
            Geen leden in afwachting van goedkeuring
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white p-6 rounded-lg shadow-ap-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Aangemeld:{" "}
                    {new Date(member.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(member.id)}
                    className="px-4 py-2 bg-ap-blue-600 hover:bg-ap-blue-700 text-white rounded-lg font-semibold"
                  >
                    ✅ Goedkeuren
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
                    className="px-4 py-2 bg-ap-red-600 hover:bg-ap-red-700 text-white rounded-lg font-semibold"
                  >
                    ❌ Afwijzen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
