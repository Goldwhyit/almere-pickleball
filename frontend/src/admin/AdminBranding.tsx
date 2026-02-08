import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AdminBranding = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string>("/logo.svg");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = () => {
    const savedLogo = localStorage.getItem("ap-logo") || "/logo.svg";
    setLogo(savedLogo);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Alleen afbeeldingsbestanden zijn toegestaan");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Bestand is te groot (max 2MB)");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = () => {
    if (!previewUrl) {
      setError("Selecteer eerst een afbeelding");
      return;
    }

    setUploading(true);
    try {
      // Save to localStorage (in production, this would be an API call to backend)
      localStorage.setItem("ap-logo", previewUrl);
      setLogo(previewUrl);
      setPreviewUrl(null);

      // Dispatch storage event to notify other components/tabs
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "ap-logo",
          newValue: previewUrl,
          url: window.location.href,
        }),
      );

      setSuccess("Logo opgeslagen! 🎉");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Fout bij opslaan van logo");
    } finally {
      setUploading(false);
    }
  };

  const handleResetLogo = () => {
    if (
      confirm("Weet je zeker dat je het logo wilt resetten naar de standaard?")
    ) {
      localStorage.removeItem("ap-logo");
      setLogo("/logo.svg");
      setPreviewUrl(null);

      // Dispatch storage event to notify other components/tabs
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "ap-logo",
          newValue: null,
          url: window.location.href,
        }),
      );

      setSuccess("Logo gereset naar standaard");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-ap-light">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-ap-blue-200 shadow-ap-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="text-ap-blue-600 hover:text-ap-blue-700 text-lg"
          >
            ← Terug
          </button>
          <h1 className="text-2xl font-bold text-ap-slate-900">
            Logo & Branding
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Current Logo Preview */}
        <div className="bg-white rounded-lg shadow-ap-md p-8 border border-ap-blue-200">
          <h2 className="text-xl font-bold text-ap-slate-900 mb-6">
            Huidge Logo
          </h2>
          <div className="flex items-center justify-center p-12 bg-ap-blue-50 rounded-lg border-2 border-dashed border-ap-blue-300">
            <img
              src={logo}
              alt="Huidge Logo"
              className="h-48 max-w-xs object-contain"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-lg shadow-ap-md p-8 border border-ap-blue-200 space-y-6">
          <h2 className="text-xl font-bold text-ap-slate-900">
            Nieuw Logo Uploaden
          </h2>

          {/* Status Messages */}
          {success && (
            <div className="bg-ap-yellow-100 border-l-4 border-ap-yellow-500 p-4 text-ap-yellow-900 rounded">
              ✓ {success}
            </div>
          )}
          {error && (
            <div className="bg-ap-red-100 border-l-4 border-ap-red-500 p-4 text-ap-red-900 rounded">
              ✕ {error}
            </div>
          )}

          {/* File Input */}
          <div>
            <label className="block text-sm font-semibold text-ap-slate-900 mb-3">
              Selecteer Logo Bestand
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-ap-slate-900 border border-ap-blue-300 rounded-lg p-3 cursor-pointer hover:border-ap-blue-500 transition"
            />
            <p className="text-xs text-ap-slate-600 mt-2">
              ✓ SVG, PNG, JPG toegestaan (max 2MB)
            </p>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-ap-slate-900">
                Preview:
              </p>
              <div className="flex items-center justify-center p-8 bg-ap-blue-50 rounded-lg border-2 border-dashed border-ap-blue-300">
                <img
                  src={previewUrl}
                  alt="Logo Preview"
                  className="h-32 max-w-xs object-contain"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              onClick={handleSaveLogo}
              disabled={!previewUrl || uploading}
              className="flex-1 px-6 py-3 bg-ap-blue-600 hover:bg-ap-blue-700 disabled:bg-ap-slate-300 text-white rounded-lg font-semibold shadow-ap-md transition"
            >
              {uploading ? "Opslaan..." : "✓ Logo Opslaan"}
            </button>
            <button
              onClick={handleResetLogo}
              className="flex-1 px-6 py-3 bg-ap-red-600 hover:bg-ap-red-700 text-white rounded-lg font-semibold shadow-ap-red transition"
            >
              ⟲ Resetten naar Standaard
            </button>
          </div>
        </div>

        {/* Branding Guidelines */}
        <div className="bg-ap-blue-50 rounded-lg shadow-ap-md p-8 border border-ap-blue-200 space-y-4">
          <h2 className="text-xl font-bold text-ap-slate-900">
            Logo Richtlijnen
          </h2>
          <ul className="space-y-3 text-ap-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-ap-yellow-500 font-bold text-lg">•</span>
              <span>
                <strong>Formaat:</strong> SVG is ideaal (schaalbaar), PNG of JPG
                ook goed
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-ap-yellow-500 font-bold text-lg">•</span>
              <span>
                <strong>Kleuren:</strong> Gebruik alleen AP Blue (#0c7fcd), AP
                Red (#dc3c3c), AP Yellow (#ffdd00) en wit
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-ap-yellow-500 font-bold text-lg">•</span>
              <span>
                <strong>Grootte:</strong> Zorg voor goede zichtbaarheid op
                kleine afmetingen
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-ap-yellow-500 font-bold text-lg">•</span>
              <span>
                <strong>Bestand:</strong> Max 2MB, optimaal rechthoekig of
                vierkant aspect ratio
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-ap-yellow-500 font-bold text-lg">•</span>
              <span>
                <strong>Sportief:</strong> Houdt het energiek, modern en
                toegankelijk
              </span>
            </li>
          </ul>
        </div>

        {/* Current Brand Colors */}
        <div className="bg-white rounded-lg shadow-ap-md p-8 border border-ap-blue-200 space-y-4">
          <h2 className="text-xl font-bold text-ap-slate-900">
            Almere Pickleball Kleuren
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-20 bg-ap-blue-600 rounded-lg shadow-ap-md"></div>
              <p className="text-sm font-semibold text-ap-slate-900">AP Blue</p>
              <p className="text-xs text-ap-slate-600">#0c7fcd</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-ap-red-600 rounded-lg shadow-ap-md"></div>
              <p className="text-sm font-semibold text-ap-slate-900">AP Red</p>
              <p className="text-xs text-ap-slate-600">#dc3c3c</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-ap-yellow-500 rounded-lg shadow-ap-md border border-ap-slate-300"></div>
              <p className="text-sm font-semibold text-ap-slate-900">
                AP Yellow
              </p>
              <p className="text-xs text-ap-slate-600">#ffdd00</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 bg-white rounded-lg shadow-ap-md border-2 border-ap-slate-300"></div>
              <p className="text-sm font-semibold text-ap-slate-900">Wit</p>
              <p className="text-xs text-ap-slate-600">#ffffff</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
