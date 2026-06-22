export default function DUPRSection({ lastUpdated }: { lastUpdated?: string }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">DUPR Rating</h2>
        <p className="text-gray-700 mb-4">
          DUPR (Dynamic Universal Pickleball Rating) is een wereldwijd beoordelingssysteem voor pickleballspelers. Je rating loopt van 2.00 (beginner) tot 8.00+ (topniveau). Hoe hoger je DUPR, hoe sterker je prestaties in wedstrijden.
        </p>
        {lastUpdated && (
          <div className="text-xs text-gray-500 mb-6">Laatste update: {new Date(lastUpdated).toLocaleDateString()}</div>
        )}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">2.00 - 3.00</h3>
            <div className="text-gray-700 mb-1">Beginner / Lage Intermediate</div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
              <li>Weinig tot geen pickleballervaring.</li>
              <li>Werkt aan basisvaardigheden zoals slagen, volley’s en serveren.</li>
              <li>Leert positionering en consistentie.</li>
            </ul>
            <p className="text-xs text-gray-600">Tip: Oefen de basis, speel met verschillende tegenstanders en werk aan reactievermogen.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">3.00 - 3.50</h3>
            <div className="text-gray-700 mb-1">Intermediate / Gemiddeld niveau</div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
              <li>Kan rally’s langer volhouden en heeft meer balcontrole.</li>
              <li>Kent de basisregels en positionering beter.</li>
            </ul>
            <p className="text-xs text-gray-600">Tip: Oefen dinks, leer strategisch spelen en werk aan voetwerk.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">3.50 - 4.00</h3>
            <div className="text-gray-700 mb-1">Advanced Intermediate</div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
              <li>Speelt met meer strategie en bewust positie op de baan.</li>
              <li>Beheerst dinks en begint topspin en slice toe te passen.</li>
            </ul>
            <p className="text-xs text-gray-600">Tip: Focus op shot placement, mentale focus en netspel.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">4.00 - 4.50</h3>
            <div className="text-gray-700 mb-1">Advanced / Sterke competitiespeler</div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
              <li>Compleet arsenaal aan slagen, speelt tactisch en met ervaring.</li>
            </ul>
            <p className="text-xs text-gray-600">Tip: Verfijn slagen, train wedstrijdsituaties en oefen met sterkere tegenstanders.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">4.50 - 5.00</h3>
            <div className="text-gray-700 mb-1">Elite / Toernooispeler op hoog niveau</div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
              <li>Zeer laag foutenpercentage, uiterst strategisch en consistent.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">5.00 - 6.00+</h3>
            <div className="text-gray-700 mb-1">Professioneel niveau / Topcompetitie</div>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
              <li>Topniveau spelers, wedstrijd- en toernooispel op professioneel niveau.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}