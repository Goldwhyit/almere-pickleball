import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingWhatsApp } from "../components/FloatingWhatsApp";
import { PhotoGallery } from "../components/PhotoGallery";
import { useAuthStore } from "../stores/auth";

type Sponsor = {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  createdAt: string;
};

export const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const [logo, setLogo] = useState<string>("/logo.svg");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  const getLocalSponsors = (): Sponsor[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw =
        localStorage.getItem("sponsors") ?? localStorage.getItem("ap-sponsors");
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed as Sponsor[];
      const maybeData = parsed as { data?: Sponsor[]; sponsors?: Sponsor[] };
      if (Array.isArray(maybeData?.sponsors)) return maybeData.sponsors;
      if (Array.isArray(maybeData?.data)) return maybeData.data;
      return [];
    } catch {
      return [];
    }
  };

  const dashboardPath =
    user?.member?.accountType === "ADMIN" ? "/dashboard" : "/trial-dashboard";

  // Load logo from localStorage on mount and listen for changes
  useEffect(() => {
    const loadLogo = () => {
      const savedLogo = localStorage.getItem("ap-logo");
      if (savedLogo) {
        setLogo(savedLogo);
      }
    };

    loadLogo();

    // Listen for storage changes from other tabs/windows
    window.addEventListener("storage", loadLogo);

    return () => {
      window.removeEventListener("storage", loadLogo);
    };
  }, []);

  useEffect(() => {
    const normalizeSponsors = (value: unknown): Sponsor[] => {
      if (Array.isArray(value)) return value as Sponsor[];
      const maybeData = value as { data?: Sponsor[]; sponsors?: Sponsor[] };
      if (Array.isArray(maybeData?.data)) return maybeData.data;
      if (Array.isArray(maybeData?.sponsors)) return maybeData.sponsors;
      return [];
    };

    const loadSponsors = () => {
      const savedSponsors = localStorage.getItem("sponsors");
      const savedV2 = localStorage.getItem("ap-sponsors");

      try {
        if (savedSponsors) {
          setSponsors(normalizeSponsors(JSON.parse(savedSponsors)));
          return;
        }
        if (savedV2) {
          setSponsors(normalizeSponsors(JSON.parse(savedV2)));
          return;
        }
      } catch {
        // ignore parse errors
      }

      setSponsors([]);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadSponsors();
      }
    };

    loadSponsors();

    const interval = window.setInterval(loadSponsors, 2000);

    window.addEventListener("storage", loadSponsors);
    window.addEventListener("sponsors:updated", loadSponsors);
    window.addEventListener("focus", loadSponsors);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", loadSponsors);
      window.removeEventListener("sponsors:updated", loadSponsors);
      window.removeEventListener("focus", loadSponsors);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-ap-blue-200 shadow-ap-sm transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-90"
            onClick={() => navigate("/")}
          >
            <img
              src={logo}
              alt="Almere Pickleball Logo"
              className="h-16 w-16 object-contain border-2 border-ap-yellow-400 rounded-md p-1 bg-black"
            />
            <div>
              <h1 className="text-xl font-bold text-ap-blue-600">
                Almere Pickleball
              </h1>
              <p className="text-xs text-ap-slate-600">Community Club</p>
            </div>
          </div>
          <div className="space-x-4 flex">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(dashboardPath)}
                className="px-6 py-2 bg-ap-blue-600 text-white rounded-lg hover:bg-ap-blue-700 shadow-ap-sm transition"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 text-ap-blue-600 hover:bg-ap-blue-50 rounded-lg transition"
                >
                  Inloggen
                </button>
                <button
                  onClick={() => navigate("/word-lid")}
                  className="px-6 py-2 bg-white text-ap-blue-700 border border-ap-blue-200 rounded-lg hover:border-ap-blue-400 hover:bg-ap-blue-50 shadow-ap-sm transition"
                >
                  Word lid
                </button>
                <button
                  onClick={() => navigate("/trial-signup")}
                  className="px-6 py-2 bg-ap-yellow-500 text-ap-black rounded-lg hover:bg-ap-yellow-600 shadow-ap-md transition font-semibold flex items-center gap-2"
                >
                  <img 
                    src="/pickleball.svg" 
                    alt="Pickleball" 
                    className="w-5 h-5"
                  />
                  Proefles
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-ap-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welkom bij Almere Pickleball
          </h1>
          <p className="text-xl mb-8 text-ap-blue-100">
            Dé plek voor pickleball in Almere
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/trial-signup")}
              className="bg-ap-yellow-500 text-ap-black font-semibold px-8 py-4 rounded-lg hover:bg-ap-yellow-600 text-lg shadow-ap-md transition flex items-center justify-center gap-3"
            >
              <img 
                src="/pickleball.svg" 
                alt="Pickleball" 
                className="w-8 h-8"
              />
              Start je gratis proefles
            </button>
            <button
              onClick={() => navigate("/word-lid")}
              className="bg-transparent text-ap-blue-600 font-semibold px-8 py-4 rounded-lg border border-ap-blue-200 hover:border-ap-blue-400 hover:text-ap-blue-700 text-lg transition"
            >
              Lid worden
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-16 text-ap-slate-900">
          Waarom Almere Pickleball?
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-12">
          {/* Moderne Faciliteiten */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-ap-blue-400 to-ap-blue-600 flex items-center justify-center shadow-ap-lg hover:shadow-ap-lg transform hover:scale-105 transition duration-300">
              <div className="text-center">
                <div className="text-6xl mb-2">🏓</div>
                <h3 className="text-white font-bold text-lg">
                  Moderne Faciliteiten
                </h3>
              </div>
            </div>
            <p className="text-center text-ap-slate-600 mt-6 max-w-xs">
              Professionele indoor courts met LED verlichting
            </p>
          </div>

          {/* Gezellige Gemeenschap */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-ap-red-400 to-ap-red-600 flex items-center justify-center shadow-ap-lg hover:shadow-ap-lg transform hover:scale-105 transition duration-300">
              <div className="text-center">
                <div className="text-6xl mb-2">👥</div>
                <h3 className="text-white font-bold text-lg">
                  Gezellige Gemeenschap
                </h3>
              </div>
            </div>
            <p className="text-center text-ap-slate-600 mt-6 max-w-xs">
              Speel met gelijkgestemden en maak vrienden
            </p>
          </div>

          {/* Professioneel Onderwijs */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-ap-yellow-400 to-ap-yellow-600 flex items-center justify-center shadow-ap-lg hover:shadow-ap-lg transform hover:scale-105 transition duration-300">
              <div className="text-center">
                <div className="text-6xl mb-2">🎓</div>
                <h3 className="text-ap-slate-900 font-bold text-lg">
                  Professioneel Onderwijs
                </h3>
              </div>
            </div>
            <p className="text-center text-ap-slate-600 mt-6 max-w-xs">
              Trainers met DUPR certificering
            </p>
          </div>
        </div>
      </section>

      {/* Trial CTA */}
      <section className="bg-ap-blue-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-ap-slate-900 mb-6">
            3 Gratis Proeflessons
          </h2>
          <p className="text-xl text-ap-slate-700 mb-8">
            Probeer pickleball gratis en ontdek waarom het zo verslavend is!
          </p>
          <ul className="text-left text-ap-slate-700 space-y-3 mb-8 max-w-md mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-ap-yellow-500 font-bold">✓</span> 3 gratis
              lessen van 60 minuten
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ap-yellow-500 font-bold">✓</span> Beginners
              welkom
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ap-yellow-500 font-bold">✓</span> Alle
              materiaal beschikbaar
            </li>
            <li className="flex items-center gap-2">
              <span className="text-ap-yellow-500 font-bold">✓</span> 30 dagen
              om je te beslissen
            </li>
          </ul>
          <button
            onClick={() => navigate("/trial-signup")}
            className="bg-ap-yellow-500 hover:bg-ap-yellow-600 text-ap-black font-semibold px-8 py-4 rounded-lg text-lg transition shadow-ap-md flex items-center justify-center gap-3 mx-auto"
          >
            <img 
              src="/pickleball.svg" 
              alt="Pickleball" 
              className="w-8 h-8"
            />
            Meld je nu aan
          </button>
          <p className="mt-4 text-ap-slate-600 text-sm">
            Klaar om meteen lid te worden?{" "}
            <button
              onClick={() => navigate("/word-lid")}
              className="text-ap-blue-600 hover:text-ap-blue-700 font-semibold transition"
            >
              Bekijk lidmaatschappen
            </button>
          </p>
        </div>
      </section>

      {/* Photo Gallery */}
      <PhotoGallery />

      {/* Sponsors Section */}
      <section className="bg-ap-light py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-ap-black">
            Onze Sponsors
          </h2>
          <p className="text-center text-ap-slate-700 mb-12 max-w-2xl mx-auto">
            We zijn dankbaar voor de steun van onze sponsors die Almere
            Pickleball mogelijk maken
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(sponsors.length > 0 ? sponsors : getLocalSponsors()).length > 0
              ? (sponsors.length > 0 ? sponsors : getLocalSponsors()).map(
                  (sponsor) => {
                    const content = (
                      <div className="flex items-center justify-center p-8 bg-white rounded-lg border border-ap-slate-200 hover:border-ap-blue-300 hover:shadow-ap-md transition">
                        <div className="text-center">
                          {sponsor.logo ? (
                            <img
                              src={sponsor.logo}
                              alt={sponsor.name}
                              className="h-16 w-auto mx-auto mb-3 object-contain"
                            />
                          ) : (
                            <div className="text-4xl mb-2">🤝</div>
                          )}
                          <p className="font-semibold text-ap-slate-800">
                            {sponsor.name}
                          </p>
                        </div>
                      </div>
                    );

                    return sponsor.website ? (
                      <a
                        key={sponsor.id}
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={sponsor.id}>{content}</div>
                    );
                  },
                )
              : ["Sponsor 1", "Sponsor 2", "Sponsor 3", "Sponsor 4"].map(
                  (name) => (
                    <div
                      key={name}
                      className="flex items-center justify-center p-8 bg-white rounded-lg border border-ap-slate-200 hover:border-ap-blue-300 hover:shadow-ap-md transition"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">🤝</div>
                        <p className="font-semibold text-ap-slate-800">
                          {name}
                        </p>
                      </div>
                    </div>
                  ),
                )}
          </div>

          <div className="mt-12 text-center">
            <p className="text-ap-slate-700 mb-4">
              Wil je Almere Pickleball sponsoren?
            </p>
            <a
              href="mailto:info@almerepickleball.nl"
              className="inline-block px-6 py-3 bg-ap-yellow-500 text-ap-black rounded-lg hover:bg-ap-yellow-600 transition shadow-ap-md"
            >
              Neem contact op
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ap-black text-ap-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center border-t border-ap-slate-800 pt-8">
          <p>&copy; 2026 Almere Pickleball. Alle rechten voorbehouden.</p>
          <p className="mt-3 text-sm">
            Klaar om lid te worden?{" "}
            <button
              onClick={() => navigate("/word-lid")}
              className="text-ap-blue-300 hover:text-ap-blue-100 font-semibold transition"
            >
              Bekijk lidmaatschappen
            </button>
          </p>
        </div>
        <style>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .animation-delay-1000 {
            animation-delay: 1s;
          }
        `}</style>
      </footer>
    </div>
  );
};
