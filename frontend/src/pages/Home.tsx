import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import ReviewsCarousel from '../components/ReviewsCarousel';
import DUPRSection from '../components/DUPRSection';
import Spelregels from '../components/Spelregels';
import NextMatch from '../components/NextMatch';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  const tileClass =
    'bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-slate-100';

  const btnPrimary =
    'inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-200 active:scale-95';
  const btnSecondary =
    'inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/30 transition-all duration-200 active:scale-95';
  const btnLight =
    'inline-flex items-center justify-center bg-white hover:bg-gray-100 text-primary-700 font-bold px-6 py-3 rounded-lg shadow-md transition-all duration-200 active:scale-95 border border-primary-100';

  useEffect(() => {
    // Component mounted
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky Header - Simplified */}
      <header className="sticky top-0 z-50 bg-primary-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2 flex items-center">
                <img src="/logo.png" alt="Almere Pickleball Logo" className="h-10 w-auto" />
              </div>
              <span className="hidden md:inline font-semibold text-lg text-white">Almere Pickleball</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {!isAuthenticated ? (
                <>
                  <Link to="/proeflessen" className="text-sm font-semibold text-white hover:text-primary-100">Gratis proefles</Link>
                  <Link to="/word-lid" className="text-sm font-semibold text-white hover:text-primary-100">Lid worden</Link>
                  <Link to="/login" className="text-xs text-primary-100 hover:text-white">Inloggen</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-sm font-semibold text-white hover:text-primary-100">Dashboard</Link>
                  <Link to="/login" className="text-xs text-primary-100 hover:text-white">Profiel</Link>
                </>
              )}
            </div>

            {/* Mobile CTAs */}
            <div className="md:hidden flex items-center gap-2">
              <Link to="/proeflessen" className="text-xs font-semibold text-white">Gratis</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero met zwevende tegels */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.15),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_25%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-200 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                  Almere Pickleball · Community first
                </p>
                <h1 className="text-4xl md:text-5xl font-black leading-tight">
                  Pickleball spelen in Almere
                </h1>
                <p className="text-lg text-primary-100 leading-relaxed max-w-2xl">
                  Voor beginners tot ervaren spelers. Samen spelen, elkaar helpen, groeien op je eigen tempo. Veel plezier, geen druk.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/proeflessen"
                    className={`${btnPrimary} px-8 py-4 shadow-xl shadow-primary-600/25`}
                  >
                    Reserveer gratis proefles
                  </Link>
                  <Link
                    to="/word-lid"
                    className={`${btnSecondary} px-8 py-4 border border-white/20`}
                  >
                    Info over lidmaatschap
                  </Link>
                </div>
              </div>

              {/* Zwevende tegels */}
              <div className="relative h-full w-full">
                <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/25 min-h-[150px] flex flex-col justify-between transition transform hover:-translate-y-1">
                    <div>
                      <p className="text-3xl font-black">150+</p>
                      <p className="text-primary-100">Actieve leden</p>
                      <p className="text-sm text-primary-200 mt-2">Spelen regelmatig</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/25 min-h-[150px] flex flex-col justify-between transition transform hover:-translate-y-1">
                    <div>
                      <p className="text-3xl font-black">4</p>
                      <p className="text-primary-100">Eigen courts</p>
                      <p className="text-sm text-primary-200 mt-2">Indoor, altijd beschikbaar</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/25 min-h-[150px] flex flex-col justify-between transition transform hover:-translate-y-1">
                    <div>
                      <p className="text-3xl font-black">100+</p>
                      <p className="text-primary-100">Sessies per maand</p>
                      <p className="text-sm text-primary-200 mt-2">Verschillende niveaus</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/25 min-h-[150px] flex flex-col justify-between transition transform hover:-translate-y-1">
                    <div>
                      <p className="text-3xl font-black">12</p>
                      <p className="text-primary-100">Toernooien/jaar</p>
                      <p className="text-sm text-primary-200 mt-2">Lokaal & nationaal</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -left-6 -bottom-8 w-28 h-28 bg-primary-500/30 blur-3xl rounded-full" />
                <div className="absolute -right-10 -top-6 w-32 h-32 bg-cyan-400/20 blur-3xl rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Wat is Pickleball - Kort en Helder */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8">
                Wat is pickleball?
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                Pickleball is een racquetsport op een klein court (ongeveer 1/3 van een tennisbaan). Je speelt met twee tegen twee, met een kunststofbal en lichte rackets. Het voelt als tennis, maar is veel makkelijker en veel socialer.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-8 border-l-4 border-primary-600">
                <h3 className="font-bold text-slate-900 mb-4">Waarom is het zo populair?</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex gap-3">
                    <span className="text-primary-600 font-bold">→</span>
                    <span><strong>Snel leren.</strong> Na twee weken speel je al hele rally's.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary-600 font-bold">→</span>
                    <span><strong>Minder fysiek zwaar.</strong> Veel minder hardlopen dan tennis, veel langer houdbaar.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary-600 font-bold">→</span>
                    <span><strong>Sociaal.</strong> Je speelt met vier personen tegelijk. Veel praten, veel lachen.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary-600 font-bold">→</span>
                    <span><strong>Voor iedereen.</strong> Van 16 tot 80 jaar. Geen fitnessvereisten.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Waarom Almere Pickleball - Clubgevoel */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-16 text-center">
              Waarom Almere Pickleball?
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className={`${tileClass} p-8 h-full`}>
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Je speelt tegen jezelf, niet tegen anderen</h3>
                <p className="text-slate-700 leading-relaxed">
                  Iedereen helpt iedereen beter worden. Beginners spelen met beginners. Geen competitiedrang, geen ego — puur plezier en groei.
                </p>
              </div>

              <div className={`${tileClass} p-8 h-full`}>
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Groeien op jouw tempo</h3>
                <p className="text-slate-700 leading-relaxed">
                  Van totale beginner tot toernooispeler — we helpen je stap voor stap. Met geduld, feedback en veel aanmoediging.
                </p>
              </div>

              <div className={`${tileClass} p-8 h-full`}>
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Echte community</h3>
                <p className="text-slate-700 leading-relaxed">
                  Regelmatige sessies, toernooien, social events. Het voelt als een echte club — met vrienden die je helpen groeien.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Kleine club, grote impact */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Almere Pickleball in cijfers</h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className={`${tileClass} text-center p-8 h-full`}>
                <div className="text-5xl font-black text-primary-600 mb-3">150+</div>
                <div className="font-bold text-slate-900">Actieve leden</div>
                <p className="text-sm text-slate-600 mt-1">Spelen regelmatig</p>
              </div>

              <div className={`${tileClass} text-center p-8 h-full`}>
                <div className="text-5xl font-black text-primary-600 mb-3">4</div>
                <div className="font-bold text-slate-900">Eigen courts</div>
                <p className="text-sm text-slate-600 mt-1">Indoor, altijd beschikbaar</p>
              </div>

              <div className={`${tileClass} text-center p-8 h-full`}>
                <div className="text-5xl font-black text-primary-600 mb-3">100+</div>
                <div className="font-bold text-slate-900">Sessies per maand</div>
                <p className="text-sm text-slate-600 mt-1">Verschillende niveaus</p>
              </div>

              <div className={`${tileClass} text-center p-8 h-full`}>
                <div className="text-5xl font-black text-primary-600 mb-3">12</div>
                <div className="font-bold text-slate-900">Toernooien/jaar</div>
                <p className="text-sm text-slate-600 mt-1">Lokaal & nationaal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Faciliteiten - Direct Actionable */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Wat je krijgt</h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className={`${tileClass} p-6 h-full flex gap-3 items-start`}>
                  <div className="text-3xl flex-shrink-0">🏐</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">4 Professionele courts</h3>
                    <p className="text-slate-600">Indoor, goed onderhouden, altijd beschikbaar</p>
                  </div>
                </div>
                <div className={`${tileClass} p-6 h-full flex gap-3 items-start`}>
                  <div className="text-3xl flex-shrink-0">⏰</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Flexibel spelen</h3>
                    <p className="text-slate-600">Ma-Za 09:00-22:00, kies wanneer het jou uitkomt</p>
                  </div>
                </div>
                <div className={`${tileClass} p-6 h-full flex gap-3 items-start`}>
                  <div className="text-3xl flex-shrink-0">👨‍🏫</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Ervaren trainers</h3>
                    <p className="text-slate-600">Geduldig, voor alle niveaus, helpen graag</p>
                  </div>
                </div>
                <div className={`${tileClass} p-6 h-full flex gap-3 items-start`}>
                  <div className="text-3xl flex-shrink-0">🛠️</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Alles voorzien</h3>
                    <p className="text-slate-600">Rackets, schoenen, café, kleedkamers, douche</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-10 text-center border-2 border-primary-200 shadow-md">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Klaar om te beginnen?</h3>
                <p className="text-slate-700 mb-8 leading-relaxed">
                  Geen ervaring nodig. We hebben alles wat je nodig hebt, en iedereen wil je helpen.
                </p>
                <Link
                  to="/proeflessen"
                  className={`${btnPrimary} px-8 py-3 text-lg`}
                >
                  → Reserveer je gratis les
                </Link>
                <p className="text-sm text-slate-600 mt-4">
                  3 sessies gratis, geen verplichting
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gratis Proefles vs Lidmaatschap - Duidelijke keuze */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Twee wegen: proefles of lidmaatschap?</h2>
            
            <div className="max-w-5xl mx-auto">
              <div className="mb-12 bg-slate-50 rounded-lg p-8 border-l-4 border-primary-600">
                <p className="text-slate-700 leading-relaxed mb-6">
                  <strong>Eerste keer pickleball spelen?</strong> Start met een gratis proefles. <strong>Drie sessies, geen kosten, geen gedoe.</strong> 
                  Je voelt hoe het voelt, ontmoet wat mensen, en beslist daarna — verder met ons, of niet.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Al zeker dat je erin wilt?</strong> Word lid. Dan speel je zoveel je wilt, voor een eerlijke maandelijkse prijs, en je bent echt onderdeel van de club.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Gratis Proefles */}
                <div className="bg-gradient-to-br from-accent-50 to-white rounded-lg p-8 border-2 border-accent-300 hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-accent-700 mb-6">Gratis proefles</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex gap-3">
                      <span className="text-accent-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>3 gratis sessies</strong> van 60 min</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-accent-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>Rackets & materiaal</strong> gratis</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-accent-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>Korte intro</strong> + veel spelen</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-accent-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>Nul verplichting</strong> na afloop</span>
                    </div>
                  </div>

                  <Link
                    to="/proeflessen"
                    className={`${btnPrimary} w-full bg-accent-600 hover:bg-accent-700 border-0 shadow-lg mb-4`}
                  >
                    Reserveer je gratis proefles
                  </Link>

                  <p className="text-sm text-slate-600 text-center">
                    Perfect voor: nieuwsgierige beginners
                  </p>
                </div>

                {/* Lidmaatschap */}
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-lg p-8 border-2 border-primary-300 hover:shadow-lg transition-shadow">
                  <h3 className="text-2xl font-bold text-primary-700 mb-6">Lid worden</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex gap-3">
                      <span className="text-primary-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>Onbeperkt spelen</strong> het hele jaar</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>Veel goedkoper</strong> dan per sessie</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>Eerste toegang</strong> toernooien & events</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary-600 font-bold text-lg">✓</span>
                      <span className="text-slate-700"><strong>Echte community</strong> & vriendschappen</span>
                    </div>
                  </div>

                  <Link
                    to="/word-lid"
                    className={`${btnPrimary} w-full shadow-lg mb-4`}
                  >
                    Bekijk lidmaatschappen
                  </Link>

                  <p className="text-sm text-slate-600 text-center">
                    Perfect voor: regelmatig spelers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - Testimonials */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Wat onze leden zeggen</h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-lg p-8 shadow-md">
                <p className="text-slate-700 italic mb-6 leading-relaxed">
                  "Ik ben 52 en had nog nooit raketsport gedaan. Nu speel ik 2× per week en heb ik vrienden gemaakt die ik zo niet had ontmoet."
                </p>
                <p className="font-bold text-slate-900">Michiel</p>
                <p className="text-sm text-slate-600">3 maanden geleden gestart</p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-md">
                <p className="text-slate-700 italic mb-6 leading-relaxed">
                  "De trainers geven je feedback zonder je afbreuk te doen. Je voelt dat iedereen je wil helpen groeien."
                </p>
                <p className="font-bold text-slate-900">Sarah</p>
                <p className="text-sm text-slate-600">Volwassen beginner</p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-md">
                <p className="text-slate-700 italic mb-6 leading-relaxed">
                  "Toernooien zijn te gek. Vorig weekend kwamen we tweede. Niemand verwachtte dat!"
                </p>
                <p className="font-bold text-slate-900">Team Almere</p>
                <p className="text-sm text-slate-600">Toernooispelers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Volgende Wedstrijd - Nieuwe Sectie */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Volgende Wedstrijd</h2>

            <NextMatch />

            <div className="mt-8 text-center">
              <Link
                to="/toernooien"
                className={`${btnPrimary} px-6 py-3`}
              >
                Bekijk alle toernooien
              </Link>
            </div>
          </div>
        </section>

        {/* Spelregels */}
        <Spelregels />

        {/* Reviews van leden na proeflessen */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Reviews van leden</h2>
            <ReviewsCarousel />
          </div>
        </section>

        {/* DUPR Section */}
        <DUPRSection />

        {/* Final CTA - Simpel en duidelijk */}
        <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Klaar om te beginnen?
            </h2>
            <p className="text-lg md:text-xl mb-12 text-primary-100 leading-relaxed">
              Drie gratis sessies, geen verplichting. Ontdek wat pickleball is en of het voor jou is.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/proeflessen"
                className={`${btnLight} px-8 py-4 text-lg`}
              >
                → Reserveer je gratis proefles
              </Link>
              <Link
                to="/word-lid"
                className={`${btnPrimary} px-8 py-4 text-lg bg-primary-500 hover:bg-primary-400 border border-primary-400`}
              >
                → Info over lidmaatschap
              </Link>
            </div>
            <p className="mt-10 text-primary-100 text-base">
              Vragen? <a href="mailto:info@almerepickleball.nl" className="underline hover:no-underline font-semibold">Mail ons of bel</a> — we helpen graag!
            </p>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
