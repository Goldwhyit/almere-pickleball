import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { membershipsAPI } from '../lib/membershipsApi';
import { settingsApi } from '../lib/settingsApi';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

function Modal({
  open,
  title,
  size = 'md',
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  size?: ModalSize;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizeMap: Record<ModalSize, string> = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeMap[size]} bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_180ms_ease-out]`}
      >
        <div className="flex items-start gap-3 px-6 py-4 border-b border-slate-200">
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-lg font-semibold text-slate-900 truncate">{title}</h3>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// Modal texts (privacy / huisregels / terms)
const PRIVACY_TEXT = `Privacybeleid
Hoe wij je persoonsgegevens beschermen en gebruiken
Laatst bijgewerkt: 1 januari 2026
Introductie
Almere Pickleball zet zich in om je privacy te beschermen. Dit beleid legt uit hoe wij je persoonsgegevens verzamelen, gebruiken en beveiligen wanneer je lid wordt of onze diensten gebruikt.
Welke gegevens we verzamelen
Wij verzamelen de volgende soorten persoonsgegevens:
* Naam en contactgegevens
* E-mailadres
* Telefoonnummer
* Noodcontactgegevens
Hoe we je gegevens gebruiken
We gebruiken je persoonsgegevens voor de volgende doelen:
* Beheer van je clublidmaatschap
* Communicatie over sessies en evenementen
* Waarborging van veiligheid tijdens activiteiten
* Verbetering van onze dienstverlening
Delen van informatie
Wij verkopen of verhandelen je persoonsgegevens niet en geven deze niet door aan derden zonder je toestemming, behalve als dat wettelijk vereist is of voor veiligheidsdoeleinden.
Gegevensbeveiliging
Wij treffen passende beveiligingsmaatregelen om je persoonsgegevens te beschermen tegen onbevoegde toegang, wijziging, openbaarmaking of vernietiging.
Jouw rechten
Je hebt de volgende rechten met betrekking tot je persoonsgegevens:
* Inzage in je persoonsgegevens
* Correctie van onjuiste gegevens
* Verwijdering van je gegevens
* Bezwaar tegen verwerking van je gegevens
Contact
Als je vragen hebt over dit privacybeleid, neem dan contact met ons op via: __s.p.n.a@outlook.nl__
Wijzigingen in dit beleid
Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. We informeren je over wijzigingen door het nieuwe beleid op onze website te plaatsen.`;

const HUISREGELS_TEXT = `Huisregels
Regels en richtlijnen voor lidmaatschap en deelname
Laatst bijgewerkt: 1 januari 2026
Aanvaarding van de voorwaarden
Door lid te worden van Almere Pickleball of deel te nemen aan onze activiteiten, ga je akkoord met deze gebruiksvoorwaarden.
Lidmaatschapseisen
Om lid te worden, moet je:
* De inschrijfprocedure afronden
* Verschuldigde kosten betalen
* De clubvrijwaring ondertekenen
* Instemmen met de clubgedragsregels
Veiligheidseisen
Voor jouw veiligheid en die van anderen:
* Draag passende sportkleding en -schoeisel
* Ga zorgvuldig om met het verstrekte materiaal
* Informeer ons over relevante gezondheidsomstandigheden
* Zorg voor passende zorg-/ongevallenverzekering
Gedragscode
Alle leden moeten:
* Anderen met respect behandelen
* Fair play-principes volgen
* Passende taal gebruiken
* Geen clubmateriaal beschadigen
Annuleringsbeleid
Sessies kunnen worden geannuleerd wegens weersomstandigheden, lage opkomst of andere omstandigheden. We informeren leden zo vroeg mogelijk.
Aansprakelijkheid
Deelname is voor eigen risico. Almere Pickleball is niet aansprakelijk voor letsel of schade die optreedt tijdens clubactiviteiten.
Beëindiging lidmaatschap
Lidmaatschap kan worden beëindigd bij:
* Schending van deze voorwaarden
* Achterstallige betaling
* Veiligheidsredenen
* Naar inzicht van de club
Wijzigingen in de voorwaarden
Wij kunnen deze voorwaarden te allen tijde aanpassen. Voortgezette deelname betekent dat je de bijgewerkte voorwaarden accepteert.
Contact
Vragen over deze voorwaarden? Neem contact met ons op via: __s.p.n.a@outlook.com__
Belangrijke kennisgeving
Door deel te nemen aan activiteiten van Almere Pickleball bevestig je dat je deze huisregels hebt gelezen, begrepen en ermee instemt.`;

const TERMS_TEXT = `Almere Pickleball vrijwaring
Laatst bijgewerkt: januari 2025
Deelname aan activiteiten georganiseerd door Almere Pickleball is volledig op eigen risico.
Beperking van aansprakelijkheid
De club, het bestuur, vrijwilligers en trainers zijn niet aansprakelijk voor schade of letsel als gevolg van:
* Handelingen van andere spelers of deelnemers
* Gebruik van materiaal zoals paddles, netten of andere objecten
* Ongevallen door omstandigheden zoals gladde/onveilige ondergronden of objecten op de baan
Verzekering
Wij raden deelnemers aan om te zorgen voor passende verzekering voor ongevallen en/of letsel.
Akkoord
Door deelname aan onze activiteiten ga je akkoord met bovenstaande voorwaarden.
Contactgegevens
Vragen over deze vrijwaring? Neem contact met ons op:`;

export default function WordLid() {
  const [selectedType, setSelectedType] = useState('yearly_upfront');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Persoonlijke gegevens
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',

    // Adres
    street: '',
    houseNumber: '',
    postalCode: '',
    city: '',

    // Lidmaatschap
    membershipType: 'adult',

    // Speelervaring
    experienceLevel: 'beginner',
    hasPlayedBefore: 'no',
    otherSports: '',

    // Noodcontact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',

    // Akkoord
    agreedToTerms: false,
    agreedToPrivacy: false,
    newsletter: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHuisregels, setShowHuisregels] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('10');

  useEffect(() => {
    settingsApi
      .getSetting('yearly_discount_percentage')
      .then((res) => {
        if (res.value) setDiscountPercentage(res.value);
      })
      .catch(() => {});
  }, []);

  const membershipPrices = {
    yearly: {
      price: 187,
      label: 'Jaarlidmaatschap',
      description: '€187 per jaar - betaal per maand €15,58',
      plan: 'YEARLY'
    },
    yearly_upfront: {
      price: 168,
      label: 'Jaarlidmaatschap ineens',
      description: `€168 ineens betalen (${discountPercentage}% korting)`,
      plan: 'YEARLY_UPFRONT'
    },
    monthly: { 
      price: 15.75, 
      label: 'Maandlidmaatschap', 
      description: '€15,75 per maand - automatische incasso',
      plan: 'MONTHLY'
    },
    per_session: { 
      price: 8.50, 
      label: 'Per keer', 
      description: '€8,50 per speeldag - betaal bij aanmelding',
      plan: 'PER_SESSION'
    },
    punch_card: { 
      price: 67.50, 
      label: 'Strippenkaart', 
      description: '€67,50 voor 10 beurten (6 maanden geldig)',
      plan: 'PUNCH_CARD'
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (name === 'membershipType') setSelectedType(value);
    }
  };

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.password) {
        alert('Vul alle verplichte persoonlijke gegevens in om door te gaan (inclusief wachtwoord).');
        return false;
      }
    }
    if (s === 2) {
      if (!formData.street || !formData.houseNumber || !formData.postalCode || !formData.city) {
        alert('Vul alle verplichte adresgegevens in om door te gaan.');
        return false;
      }
      if (!formData.hasPlayedBefore || !formData.experienceLevel) {
        alert('Vul je speelervaring in om door te gaan.');
        return false;
      }
    }
    if (s === 3) {
      if (!formData.emergencyName || !formData.emergencyPhone || !formData.emergencyRelation) {
        alert('Vul alle verplichte noodcontactgegevens in.');
        return false;
      }
      if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
        alert('Je moet akkoord gaan met de algemene voorwaarden en het privacybeleid.');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };

  const back = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setIsSubmitting(true);

    try {
      // Only send required DTO fields
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        street: formData.street,
        houseNumber: formData.houseNumber,
        postalCode: formData.postalCode,
        city: formData.city,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelation: formData.emergencyRelation,
        membershipType: membershipPrices[selectedType as keyof typeof membershipPrices]?.plan || 'PER_SESSION',
        agreedToTerms: formData.agreedToTerms,
        agreedToPrivacy: formData.agreedToPrivacy,
        newsletter: formData.newsletter ?? false,
        password: formData.password,
      };
      const response = await membershipsAPI.apply(payload);
      console.log('Membership application submitted:', response);
      localStorage.setItem('membershipData', JSON.stringify(response));
      localStorage.setItem('membershipSubmitted', 'true');
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting membership:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw alstublieft.');
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Aanmelding ontvangen!</h2>
          <p className="text-lg text-slate-700 mb-4">
            Bedankt {formData.firstName}! Je account is aangemaakt en je kunt nu inloggen.
          </p>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-slate-900 mb-2">✓ Je kunt nu inloggen met:</p>
            <p className="text-sm text-slate-700"><strong>Email:</strong> {formData.email}</p>
            <p className="text-sm text-slate-700"><strong>Wachtwoord:</strong> Het wachtwoord dat je hebt ingesteld</p>
          </div>
          <p className="text-base text-slate-700 mb-8">
            We nemen binnen 2 werkdagen contact met je op om je lidmaatschap in te richten.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-slate-900 mb-4">Wat nu?</h3>
            <ul className="text-slate-700 space-y-2 text-sm">
              <li className="flex gap-2"><span>✓</span><span>Je ontvangt een bevestigingsmail</span></li>
              <li className="flex gap-2"><span>✓</span><span>We nemen contact op om details in te vullen</span></li>
              <li className="flex gap-2"><span>✓</span><span>Je krijgt je inloginformatie</span></li>
              <li className="flex gap-2"><span>✓</span><span>Welkom bij Almere Pickleball! 🎾</span></li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              → Terug naar home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12 px-4">
      <header className="sticky top-0 z-50 bg-primary-600 shadow-lg mb-8 -mx-4 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2 flex items-center">
                <img src="/logo.png" alt="Almere Pickleball Logo" className="h-10 w-auto" />
              </div>
              <span className="hidden md:inline font-semibold text-lg text-white">Almere Pickleball</span>
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="text-white hover:text-primary-100 text-sm font-semibold"
            >
              ← Terug
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Word lid van Almere Pickleball</h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Onbeperkt spelen. Deel van een echte community. Toegang tot toernooien en events. Kies het plan dat bij je past.
          </p>
        </div>

        {/* Membership Options - Simple Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">Overzicht Tarieven 2026</h2>
          <p className="text-center text-slate-600 mb-8">Kies het lidmaatschap dat het beste bij jou past</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(membershipPrices).map(([key, info]) => {
              const isPunchCard = key === 'punch_card';
              const isPerSession = key === 'per_session';
              const isYearly = key === 'yearly';
              const isYearlyUpfront = key === 'yearly_upfront';
              const isMonthly = key === 'monthly';
              
              return (
                <label
                  key={key}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedType === key
                      ? 'border-primary-600 bg-primary-50 shadow-xl scale-105'
                      : 'border-slate-200 hover:border-primary-400 bg-white hover:shadow-lg'
                  } ${isYearlyUpfront ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                >
                  <input
                    type="radio"
                    name="membershipType"
                    value={key}
                    checked={selectedType === key}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {isYearlyUpfront && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {discountPercentage}% KORTING
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="font-bold text-lg text-slate-900 mb-2">{info.label}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{info.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-primary-600">€{info.price}</span>
                    {isPunchCard && <span className="text-slate-500 text-sm">(10 beurten)</span>}
                  </div>
                  {isPunchCard && (
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>✓ 6 maanden geldig</p>
                      <p>✓ 1x per week wijzigbaar</p>
                    </div>
                  )}
                  {isPerSession && (
                    <div className="text-xs text-slate-500">
                      <p>✓ Betaal per speeldag</p>
                    </div>
                  )}
                  {isYearly && (
                    <div className="text-xs text-slate-500">
                      <p>✓ Automatische incasso</p>
                    </div>
                  )}
                  {isMonthly && (
                    <div className="text-xs text-slate-500">
                      <p>✓ Maandelijks opzegbaar</p>
                    </div>
                  )}
                  {selectedType === key && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Multi-step Form */}
        <div className="bg-white rounded-lg shadow-md p-8 overflow-hidden">
          <div className="mb-8 flex items-center justify-center gap-2">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</div>
            <div className={`h-1 w-12 ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</div>
            <div className={`h-1 w-12 ${step >= 3 ? 'bg-primary-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</div>
          </div>

          <form onSubmit={handleSubmit} className="overflow-hidden">
            <div className="flex transition-transform duration-500" style={{ width: '300%', transform: `translateX(-${(step - 1) * 33.333}%)` }}>
              {/* Step 1: Persoonlijke Gegevens */}
              <div className="w-1/3 px-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Even dit voorzien</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Voornaam *</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="Johan" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Achternaam *</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Jansen" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="jij@email.com" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefoonnummer *</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="06 12345678" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Geboortedatum *</label>
                    <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Wachtwoord *</label>
                    <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Kies een veilig wachtwoord" minLength={6} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                    <p className="text-xs text-slate-500 mt-1">Minimaal 6 karakters. Hiermee kun je later inloggen op je dashboard.</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Adres & Speelervaring */}
              <div className="w-1/3 px-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Waar ben je?</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Straat *</label>
                    <input type="text" name="street" required value={formData.street} onChange={handleChange} placeholder="Bijv. Hoofdstraat" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Huisnummer *</label>
                    <input type="text" name="houseNumber" required value={formData.houseNumber} onChange={handleChange} placeholder="42" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Postcode *</label>
                    <input type="text" name="postalCode" required value={formData.postalCode} onChange={handleChange} placeholder="1234AB" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Plaats *</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleChange} placeholder="Almere" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Heb je eerder pickleball gespeeld? *</label>
                    <select name="hasPlayedBefore" required value={formData.hasPlayedBefore} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600">
                      <option value="no">Nee, ik ben beginner</option>
                      <option value="few">Een paar keer geprobeerd</option>
                      <option value="yes">Ja, ik speel regelmatig</option>
                      <option value="advanced">Ja, gevorderd niveau</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Niveau inschatting *</label>
                    <select name="experienceLevel" required value={formData.experienceLevel} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Gemiddeld</option>
                      <option value="advanced">Gevorderd</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Andere racketsporten ervaring (optioneel)</label>
                    <input type="text" name="otherSports" value={formData.otherSports} onChange={handleChange} placeholder="Bijv. tennis, padel, badminton" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                </div>
              </div>

              {/* Step 3: Noodcontact & Akkoord */}
              <div className="w-1/3 px-2">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Noodcontact & Akkoord</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Naam noodcontact *</label>
                    <input type="text" name="emergencyName" required value={formData.emergencyName} onChange={handleChange} placeholder="Bijv. partner of familielid" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefoonnummer noodcontact *</label>
                    <input type="tel" name="emergencyPhone" required value={formData.emergencyPhone} onChange={handleChange} placeholder="06 12345678" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Relatie *</label>
                    <input type="text" name="emergencyRelation" required value={formData.emergencyRelation} onChange={handleChange} placeholder="Bijv. partner, ouder, broer/zus" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-primary-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" name="agreedToTerms" required checked={formData.agreedToTerms} onChange={handleChange} className="mt-1 h-5 w-5 text-primary-600 border-slate-300 rounded" />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      Ik ga akkoord met de <button type="button" onClick={() => setShowTerms(true)} className="text-primary-600 hover:underline font-semibold">algemene voorwaarden</button> *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" name="agreedToPrivacy" required checked={formData.agreedToPrivacy} onChange={handleChange} className="mt-1 h-5 w-5 text-primary-600 border-slate-300 rounded" />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      Ik ga akkoord met het <button type="button" onClick={() => setShowPrivacy(true)} className="text-primary-600 hover:underline font-semibold">privacybeleid</button> *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer">
                    <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} className="mt-1 h-5 w-5 text-primary-600 border-slate-300 rounded" />
                    <span className="text-sm text-slate-700">
                      Ja, stuur me info over club events en toernooien
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button type="button" onClick={back} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors">Terug</button>
              )}
              {step < 3 && (
                <button type="button" onClick={next} className="ml-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">Volgende →</button>
              )}
              {step === 3 && (
                <button type="submit" disabled={isSubmitting || !formData.agreedToTerms || !formData.agreedToPrivacy} className="ml-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed">
                  {isSubmitting ? 'Bezig...' : 'Meld me aan als lid →'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Modals - Terms & Privacy */}
        <Modal open={showPrivacy} title="Privacybeleid" onClose={() => setShowPrivacy(false)} size="lg">
          <div className="text-sm text-slate-700 space-y-4 mb-8">
            <div className="whitespace-pre-line leading-relaxed max-h-[50vh] overflow-y-auto pr-4">
              {PRIVACY_TEXT}
            </div>
          </div>
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button 
              type="button" 
              onClick={() => setShowPrivacy(false)}
              className="ml-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Ik heb dit gelezen
            </button>
          </div>
        </Modal>

        <Modal open={showTerms} title="Algemene Voorwaarden" onClose={() => setShowTerms(false)} size="lg">
          <div className="text-sm text-slate-700 space-y-4 mb-8">
            <div className="whitespace-pre-line leading-relaxed max-h-[50vh] overflow-y-auto pr-4">
              {TERMS_TEXT}
            </div>
          </div>
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button 
              type="button" 
              onClick={() => setShowTerms(false)}
              className="ml-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Ik begrijp de voorwaarden
            </button>
          </div>
        </Modal>

        <Modal open={showHuisregels} title="Huisregels" onClose={() => setShowHuisregels(false)} size="lg">
          <div className="text-sm text-slate-700 space-y-4 mb-8">
            <div className="whitespace-pre-line leading-relaxed max-h-[50vh] overflow-y-auto pr-4">
              {HUISREGELS_TEXT}
            </div>
          </div>
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button 
              type="button" 
              onClick={() => setShowHuisregels(false)}
              className="ml-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Ik heb dit gelezen
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}