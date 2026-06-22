// frontend/src/components/Spelregels.tsx
import { useState } from 'react';
import Modal from './Modal';

export default function Spelregels() {
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showHousegulesModal, setShowHousegulesModal] = useState(false);

  const spelregelsContent = `
Pickleball Spelregels

1. SERVICEREN
   - De service moet altijd diagonaal worden gegeven
   - De bal moet onder de heup worden geraakt
   - De paddle moet onder polshoogte beginnen
   - De server mag maximaal één fout maken
   - Service wordt gegeven van achter de baseline

2. SCORE
   - Punten kunnen alleen door de serveerder worden gescoord
   - Een spelletje is gewonnen op 11 punten (met minimaal 2 puntsvoorsprong)
   - Als de stand 10-10 is, speelt men door tot iemand 2 punten voorsprong heeft
   - In een 3-set match telt de derde set alleen tot 5 punten

3. BOUNCE-RULE
   - Na het service moet de bal op het serveervak en het servicevak eerst één keer stuiteren
   - Daarna mag de bal direct worden geretourneerd

4. KITCHEN
   - De kitchen (non-volley zone) is het gebied 2,21 meter (7 voet) van het net
   - Je mag niet in de kitchen spelen, ook niet om naar beneden te reiken
   - Na een volley mag je niet in de kitchen stappen

5. FAULTS
   - Mislukking: service valt buiten het servicevak
   - De bal twee keer raken voordat deze stuitert
   - De bal raken boven schouderhoogte
   - Double bounce regel overtreden
   - De kitchen betreden of raken

6. TOERNOOIEN
   - Maak je altijd op tijd
   - Respecteer je tegenstanders en medespelers
   - Volg de richtlijnen van de toernooileider
  `;

  const huisregelsContent = `
Huishoudelijk Reglement Almere Pickleball

1. CLUBFACILITEITEN
   - Letten op nette kleding (geen straatvuil op de banen)
   - Schoenen moeten schoon zijn (geen buitenschoenen op de banen)
   - Alleen drinkflessen met water toegestaan
   - Eet- en drinkartikelentrommels buiten de banen houden

2. GEDRAG & RESPECT
   - Behandel medespelers, tegenstanders en clubmedewerkers met respect
   - Geen agressief gedrag, schelden of discriminatie
   - Houd jezelf en anderen aan de regels
   - Bij onenigheid altijd het bestuur inschakelen

3. SPELEN
   - Wees stipt voor je boekingen
   - Annuleer op tijd als je niet kunt spelen
   - Help mee met het opbouwen en afbreken van het materiaal
   - Meld defecten onmiddellijk aan de clubleiding

4. LEDEN
   - Betaal je contributie op tijd
   - Neem deel aan clubactiviteiten
   - Volg de mededelingen van het bestuur op
   - Help waar mogelijk mee aan clubactiviteiten

5. JONGEREN
   - Ouders/verzorgers zijn verantwoordelijk voor toezicht
   - Speeltijd is beperkt tot openingsuren
   - Geen geschreeuw of wild gedrag op de banen

6. KLACHTEN
   - Meld klachten schriftelijk in bij het bestuur
   - Wij behandelen alle meldingen vertrouwelijk en fair
   - Reactie binnen 14 dagen gegarandeerd

7. SANCTIES
   - Waarschuwing voor eerste overtreding
   - Schorsing voor herhaalde overtredingen
   - Uitsluitingsclausule bij ernstige schendingen
  `;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Spelregels & Huisregels</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lees onze spelregels en huishoudelijk reglement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Spelregels Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center mb-6">
              <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Spelregels</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Alles over de officiële pickleball spelregels, service, scoring, en wat is toegestaan op het veld.
            </p>
            <button
              onClick={() => setShowRulesModal(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Lees Spelregels →
            </button>
          </div>

          {/* Huisregels Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
            <div className="flex items-center mb-6">
              <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Huishoudelijk Reglement</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Ons huishoudelijk reglement met regels voor gedrag, faciliteiten en clubleden.
            </p>
            <button
              onClick={() => setShowHousegulesModal(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Lees Huisregels →
            </button>
          </div>
        </div>
      </div>

      {/* Spelregels Modal */}
      <Modal
        open={showRulesModal}
        title="Pickleball Spelregels"
        onClose={() => setShowRulesModal(false)}
      >
        <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
          {spelregelsContent}
        </div>
      </Modal>

      {/* Huisregels Modal */}
      <Modal
        open={showHousegulesModal}
        title="Huishoudelijk Reglement"
        onClose={() => setShowHousegulesModal(false)}
      >
        <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
          {huisregelsContent}
        </div>
      </Modal>
    </section>
  );
}