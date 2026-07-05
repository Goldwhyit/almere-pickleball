import { useNavigate, useLocation } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = (location.state?.mode as 'trial' | 'membership' | undefined) || 'trial';

  const title = mode === 'membership' ? 'Lid worden bij Almere Pickleball' : 'Proeflessen starten';
  const subtitle = mode === 'membership'
    ? 'We helpen je stap voor stap om je lidmaatschap aan te vragen.'
    : 'Meld je aan voor 3 gratis proeflessen en krijg meteen een overzicht van je volgende stappen.';

  const steps = mode === 'membership'
    ? [
        'Vul je gegevens in',
        'Kies je lidmaatschap',
        'Bevestig je aanvraag',
      ]
    : [
        'Maak een account aan',
        'Kies 3 proeflesdatums',
        'Volg je voortgang in je dashboard',
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎾</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        <div className="space-y-3 mb-8">
          {steps.map((step, index) => (
            <div key={step} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                {index + 1}
              </div>
              <p className="text-sm text-slate-700">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(mode === 'membership' ? '/word-lid' : '/trial-signup')}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            {mode === 'membership' ? 'Ga verder naar lid worden' : 'Ga verder naar proeflessen'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Terug naar home
          </button>
        </div>
      </div>
    </div>
  );
}
