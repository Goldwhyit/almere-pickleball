import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean with logo on white */}
      <section className="relative bg-white overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-primary-50 opacity-60"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo - Clean on white */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <img 
                  src="/logo.png" 
                  alt="Almere Pickleball Logo" 
                  className="h-32 md:h-40 w-auto"
                />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900">
              Welkom bij <span className="text-primary-600">Almere Pickleball</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-2xl mx-auto">
              De snelst groeiende racquetsport van Nederland!
            </p>
            
            {/* Floating buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/word-lid"
                    className="group relative bg-white text-primary-600 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 border-2 border-primary-500"
                  >
                    <span className="relative z-10">Word Lid</span>
                    <div className="absolute inset-0 bg-primary-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/proeflessen"
                    className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                  >
                    3 Gratis Proeflessen
                  </Link>
                  <Link
                    to="/login"
                    className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                  >
                    Inloggen
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1"
                >
                  Naar Dashboard →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
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
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Word Lid!</h3>
              <p className="text-gray-600 mb-6">
                Onbeperkt spelen, deelname aan toernooien, trainingen en meer. 
                Kies het lidmaatschap dat bij jou past.
              </p>
              <div className="space-y-4">
                <Link
                  to="/word-lid"
                  className="block w-full bg-primary-500 hover:bg-primary-600 text-white text-center font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Meld je aan als Lid →
                </Link>
                <Link
                  to="/proeflessen"
                  className="block w-full bg-accent-500 hover:bg-accent-600 text-white text-center font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  3 Gratis Proeflessen →
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Niet zeker? Probeer eerst 3 gratis lessen!
              </p>
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
            Word lid of probeer eerst 3 gratis lessen!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/word-lid"
              className="inline-block bg-white text-primary-600 hover:bg-gray-50 font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:-translate-y-1"
            >
              Word Lid →
            </Link>
            <Link
              to="/proeflessen"
              className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:-translate-y-1"
            >
              3 Gratis Proeflessen →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
