import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Pickleheads inspired */}
      <section className="relative bg-gradient-to-r from-primary-500 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/logo.png" 
                alt="Almere Pickleball Logo" 
                className="h-32 md:h-40 w-auto"
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-ball-400">Almere Pickleball</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-50 max-w-2xl mx-auto font-light">
              De snelst groeiende racquetsport van Nederland!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition shadow-lg"
                  >
                    Word Lid
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition shadow-lg"
                  >
                    Inloggen
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition shadow-lg"
                >
                  Naar Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Waarom Pickleball?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Een sport die iedereen kan leren en waar je direct plezier van hebt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-primary-50 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="bg-primary-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Makkelijk te Leren</h3>
              <p className="text-gray-600">
                In 15 minuten kun je al rally's spelen. Perfect voor beginners en gevorderden!
              </p>
            </div>

            <div className="bg-accent-50 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="bg-accent-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sociaal & Actief</h3>
              <p className="text-gray-600">
                Ontmoet nieuwe mensen terwijl je beweegt. Geschikt voor alle leeftijden!
              </p>
            </div>

            <div className="bg-ball-400 bg-opacity-10 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="bg-ball-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Competitief</h3>
              <p className="text-gray-600">
                Doe mee aan toernooien, leagues en verbeter je DUPR rating!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Club Info Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Onze Club
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Almere Pickleball is dé plek voor pickleballers in de regio Almere en omstreken. 
                We bieden trainingen, open speeltijden en organiseren regelmatig toernooien.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-primary-500 text-white p-2 rounded-lg mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">4 Indoor banen</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary-500 text-white p-2 rounded-lg mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Open ma-zo 09:00-22:00</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary-500 text-white p-2 rounded-lg mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Professionele trainers</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-primary-500 text-white p-2 rounded-lg mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">Competities & toernooien</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Lidmaatschap</h3>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Volwassenen</span>
                    <span className="text-2xl font-bold text-primary-600">€350</span>
                  </div>
                  <p className="text-sm text-gray-600">per jaar</p>
                </div>
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Jongeren (&lt;18)</span>
                    <span className="text-2xl font-bold text-primary-600">€200</span>
                  </div>
                  <p className="text-sm text-gray-600">per jaar</p>
                </div>
                <div className="pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Gezin</span>
                    <span className="text-2xl font-bold text-primary-600">€800</span>
                  </div>
                  <p className="text-sm text-gray-600">per jaar</p>
                </div>
              </div>
              <Link
                to="/register"
                className="block w-full bg-accent-500 hover:bg-accent-600 text-white text-center font-semibold py-3 px-4 rounded-lg transition mt-6"
              >
                Word Nu Lid
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl mb-8 text-primary-50">
            Kom langs voor een gratis proefles!
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg transition shadow-lg"
          >
            Meld je aan →
          </Link>
        </div>
      </section>
    </div>
  );
}
