import { useState } from 'react';
import { tournamentAPI } from '../../lib/tournamentApi';
import { useAuthStore } from '../../stores/authStore';

export default function TournamentForm({ tournament, onClose, onSuccess }: { tournament?: any, onClose: () => void, onSuccess: () => void }) {
  const initial = tournament;
  const { user } = useAuthStore();
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'DOUBLES_MIXED');
  const [format, setFormat] = useState(initial?.format || 'ROUND_ROBIN');
  const [doublesFormat, setDoublesFormat] = useState(initial?.doublesFormat || 'ROUND_ROBIN_DOUBLES');
  const [status, setStatus] = useState(initial?.status || 'DRAFT');
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(initial?.startDate ? initial.startDate.slice(0,10) : today);
  const [endDate, setEndDate] = useState(initial?.endDate ? initial.endDate.slice(0,10) : sevenDaysLater);
  const [startTime, setStartTime] = useState(initial?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initial?.endTime || '17:00');
  const [location, setLocation] = useState(initial?.location || 'Almere');
  const [maxParticipants, setMaxParticipants] = useState(initial?.maxParticipants || 16);
  const [level, setLevel] = useState(initial?.minSkillLevel || 'beginner');
  const [entryFee, setEntryFee] = useState(initial?.entryFee || 0);
  const [registrationDeadline, setRegistrationDeadline] = useState(initial?.registrationDeadline ? initial.registrationDeadline.slice(0,10) : today);
  const [matchDuration, setMatchDuration] = useState(initial?.matchDuration || 45);
  const [breakTime, setBreakTime] = useState(initial?.breakTime || 15);
  const [availableCourts, setAvailableCourts] = useState(initial?.availableCourts || 4);
  const initialTotalMinutes = initial?.totalTimeMinutes ?? 240;
  const [totalTimeHours, setTotalTimeHours] = useState(Math.floor(initialTotalMinutes / 60));
  const [totalTimeMinutesPart, setTotalTimeMinutesPart] = useState(initialTotalMinutes % 60);
  const [scoringFormat, setScoringFormat] = useState(initial?.rules?.scoring || 'standard');
  const [tieBreaker, setTieBreaker] = useState(initial?.rules?.tieBreaker || 'none');
  const [winBy, setWinBy] = useState(initial?.rules?.winBy || 2);
  const [sets, setSets] = useState(initial?.rules?.sets || 3);
  const [hasConsolation, setHasConsolation] = useState(initial?.hasConsolation ?? false);
  const [hasBronzeMatch, setHasBronzeMatch] = useState(initial?.hasBronzeMatch ?? false);
  const [description, setDescription] = useState(initial?.description || '');
  const [temporaryPlayers, setTemporaryPlayers] = useState(initial?.temporaryPlayers || []);
  const [showTempPlayerForm, setShowTempPlayerForm] = useState(false);
  const [showTempPlayerSection, setShowTempPlayerSection] = useState(false);
  const [tempPlayerForm, setTempPlayerForm] = useState({ name: '', gender: 'M', level: 'intermediate', duprRating: 3.0, age: '' });

  // Calculate estimated matches based on format
  const calculateEstimatedMatches = (formatType?: string) => {
    const participants = Number(maxParticipants);
    const fmt = formatType || format;
    switch(fmt) {
      case 'ROUND_ROBIN':
        // Everyone plays everyone: n*(n-1)/2 for singles, or n*(n-1)/2 for teams
        return Math.floor((participants * (participants - 1)) / 2);
      case 'SINGLE_ELIMINATION':
        // Knockout: n-1 matches
        return participants - 1;
      case 'DOUBLE_ELIMINATION':
        // Roughly 2*(n-1) matches
        return 2 * (participants - 1);
      case 'LEAGUE':
        // Similar to round robin
        return Math.floor((participants * (participants - 1)) / 2);
      case 'LADDER':
        // Estimate: each player plays 3-5 matches
        return participants * 4;
      default:
        return participants;
    }
  };

  // Calculate which formats fit within time window
  const calculateFeasibleFormats = () => {
    const duration = Number(matchDuration);
    const breakT = Number(breakTime);
    const courts = Number(availableCourts) || 1; // Default to 1 if not set
    
    // Available time in minutes
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const availableMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    const formats = [
      { name: 'ROUND_ROBIN', label: 'Round Robin' },
      { name: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
      { name: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
      { name: 'LEAGUE', label: 'League' },
      { name: 'LADDER', label: 'Ladder' }
    ];
    
    return formats.map(fmt => {
      const matches = calculateEstimatedMatches(fmt.name);
      // With multiple courts, matches can be played in parallel
      // Number of rounds needed = ceil(matches / courts)
      const rounds = Math.ceil(matches / courts);
      const totalMatchTime = rounds * duration;
      const totalBreakTime = Math.max(0, rounds - 1) * breakT;
      const totalNeeded = totalMatchTime + totalBreakTime;
      const fits = totalNeeded <= availableMinutes;
      
      return {
        ...fmt,
        matches,
        rounds,
        totalNeeded,
        fits,
        difference: availableMinutes - totalNeeded
      };
    });
  };

  // Calculate time requirements
  const calculateTimeRequirements = () => {
    const matches = calculateEstimatedMatches();
    const duration = Number(matchDuration);
    const breakT = Number(breakTime);
    const courts = Number(availableCourts) || 1; // Default to 1 if not set
    
    // With multiple courts, matches can be played in parallel
    // Number of rounds needed = ceil(matches / courts)
    const rounds = Math.ceil(matches / courts);
    const totalMatchTime = rounds * duration;
    const totalBreakTime = Math.max(0, rounds - 1) * breakT;
    const totalNeeded = totalMatchTime + totalBreakTime;
    
    // Available time in minutes
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const availableMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    // Calculate difference
    const difference = availableMinutes - totalNeeded;
    
    // Suggest optimal times if over time
    let suggestedMatchDuration = duration;
    let suggestedBreakTime = breakT;
    
    if (difference < 0 && rounds > 0) {
      // Need to reduce time - try to fit in available window
      const timePerRound = Math.floor(availableMinutes / rounds);
      suggestedMatchDuration = Math.max(15, Math.floor(timePerRound * 0.75));
      suggestedBreakTime = Math.max(5, Math.floor(timePerRound * 0.25));
    }
    
    return {
      matches,
      rounds,
      courts,
      totalNeeded,
      availableMinutes,
      difference,
      suggestedMatchDuration,
      suggestedBreakTime,
      hours: Math.floor(Math.abs(difference) / 60),
      minutes: Math.abs(difference) % 60
    };
  };

  // Temporary players management functions
  const addTemporaryPlayer = () => {
    if (!tempPlayerForm.name) return;
    const newPlayer = {
      id: `TEMP_${Date.now()}_${Math.random()}`,
      name: tempPlayerForm.name,
      gender: tempPlayerForm.gender,
      level: tempPlayerForm.level,
      duprRating: parseFloat(tempPlayerForm.duprRating.toString()),
      age: tempPlayerForm.age || undefined,
    };
    setTemporaryPlayers([...temporaryPlayers, newPlayer]);
    setTempPlayerForm({ name: '', gender: 'M', level: 'intermediate', duprRating: 3.0, age: '' });
  };

  const removeTemporaryPlayer = (playerId: string) => {
    setTemporaryPlayers(temporaryPlayers.filter((p: any) => p.id !== playerId));
  };

  const updateTemporaryPlayer = (playerId: string, updates: any) => {
    setTemporaryPlayers(temporaryPlayers.map((p: any) => 
      p.id === playerId ? { ...p, ...updates } : p
    ));
  };

  const isSingleFormat = type.startsWith('SINGLES');
  const enrolledCount = initial?.enrolledCount || 0;
  const tempPlayerCount = temporaryPlayers.length;
  const totalParticipants = enrolledCount + tempPlayerCount;
  const remainingSpots = Math.max(0, maxParticipants - totalParticipants);

  const timeCalc = calculateTimeRequirements();
  const feasibleFormats = calculateFeasibleFormats();

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      
      if (!user?.id) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in';
        toast.textContent = 'Je moet ingelogd zijn om een toernooi aan te maken';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transition = 'opacity 0.3s';
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 4000);
        return;
      }
      
      try {
        const computedTotalTimeMinutes = Number(totalTimeHours || 0) * 60 + Number(totalTimeMinutesPart || 0);

        const data = {
          name,
          type,
          format,
          doublesFormat,
          status,
          startDate,
          endDate,
          startTime,
          endTime,
          location,
          maxParticipants: Number(maxParticipants),
          minSkillLevel: level,
          entryFee: Number(entryFee),
          registrationDeadline,
          matchDuration: Number(matchDuration),
          breakTime: Number(breakTime),
          availableCourts: Number(availableCourts),
          totalTimeMinutes: computedTotalTimeMinutes,
          rules: { scoring: scoringFormat, tieBreaker, winBy, sets },
          hasConsolation,
          hasBronzeMatch,
          description,
          temporaryPlayers,
          temporaryCount: tempPlayerCount,
          createdById: user.id,
        };
        
        if (initial?.id) {
          await tournamentAPI.update(initial.id, data);
          console.log('Toernooi bijgewerkt');
        } else {
          const result = await tournamentAPI.create(data);
          console.log('Toernooi aangemaakt:', result);
        }
        
        // Success toast
        const successToast = document.createElement('div');
        successToast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in';
        successToast.textContent = initial?.id ? 'Toernooi succesvol bijgewerkt!' : 'Toernooi succesvol aangemaakt!';
        document.body.appendChild(successToast);
        setTimeout(() => {
          successToast.style.opacity = '0';
          successToast.style.transition = 'opacity 0.3s';
          setTimeout(() => document.body.removeChild(successToast), 300);
        }, 3000);
        
        onSuccess();
      } catch (err: any) {
        console.error('Fout bij opslaan toernooi:', err);
        const errorMsg = err?.response?.data?.message || err?.message || 'Onbekende fout bij opslaan';
        
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-[9999] animate-fade-in';
        toast.textContent = `Fout: ${errorMsg}`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transition = 'opacity 0.3s';
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 4000);
      }
    }} className="space-y-4">
      <div>
        <label>Naam</label>
        <input value={name} onChange={e => setName(e.target.value)} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div>
        <label>Niveau</label>
        <select value={level} onChange={e => setLevel(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="">Alle niveaus</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div>
        <label>Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1 w-full">
          <optgroup label="Singles">
            <option value="SINGLES_MAN">Singles - Mannen</option>
            <option value="SINGLES_WOMAN">Singles - Vrouwen</option>
            <option value="SINGLES_MIXED">Singles - Gemengd</option>
          </optgroup>
          <optgroup label="Doubles">
            <option value="DOUBLES_MAN">Doubles - Mannen</option>
            <option value="DOUBLES_WOMAN">Doubles - Vrouwen</option>
            <option value="DOUBLES_MIXED">Doubles - Gemengd</option>
          </optgroup>
        </select>
      </div>
      <div>
        <label>Toernooi Formaat</label>
        <select value={format} onChange={e => setFormat(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="ROUND_ROBIN" title="Iedereen speelt tegen iedereen één keer. Veel speeltijd, ideaal voor beginners.">Round Robin (iedereen speelt tegen iedereen)</option>
          <option value="SINGLE_ELIMINATION" title="Één verlies en je bent uit. Intense competitie voor ervaren spelers.">Single Elimination (knockout)</option>
          <option value="DOUBLE_ELIMINATION" title="Losers bracket: tweede kans na verlies. Minder stressig maar competitief.">Double Elimination (2 levens)</option>
          <option value="POOL_PLAY" title="Groepsfase (round robin) gevolgd door brackets. Ideaal voor grote toernooien.">Pool Play (groepen + bracket)</option>
          <option value="LEAGUE" title="Competitie format met meerdere speelrondes.">League (competitie)</option>
          <option value="LADDER" title="Ranking-gebaseerd format waar spelers elkaar uitdagen.">Ladder (ranking)</option>
        </select>
      </div>
      {!isSingleFormat && (
        <div>
          <label>Doubles speelvorm</label>
          <select value={doublesFormat} onChange={e => setDoublesFormat(e.target.value)} className="border rounded px-2 py-1 w-full">
            <option value="CLASSIC_DOUBLES">Klassieke doubles</option>
            <option value="MIXED_DOUBLES">Mixed doubles</option>
            <option value="AMERICANO_DOUBLES">Americano doubles</option>
            <option value="MEXICANO_DOUBLES">Mexicano doubles</option>
            <option value="ROUND_ROBIN_DOUBLES">Round Robin doubles</option>
            <option value="KING_OF_THE_COURT_DOUBLES">King of the Court</option>
            <option value="FAST4_DOUBLES">Fast4 doubles</option>
            <option value="TIEBREAK_DOUBLES">Tie-break doubles</option>
          </select>
        </div>
      )}
      <div>
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="DRAFT">Concept</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">Bezig</option>
          <option value="COMPLETED">Afgerond</option>
          <option value="CANCELLED">Geannuleerd</option>
        </select>
      </div>
      <div>
        <label>Startdatum</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1 w-full" required />
      </div>
      <div>
        <label>Totale speeltijd</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-gray-600">Uren</span>
            <input
              type="number"
              min={0}
              value={totalTimeHours}
              onChange={e => setTotalTimeHours(Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div>
            <span className="text-xs text-gray-600">Minuten</span>
            <input
              type="number"
              min={0}
              max={59}
              value={totalTimeMinutesPart}
              onChange={e => setTotalTimeMinutesPart(Math.min(59, Math.max(0, Number(e.target.value))))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Wordt omgerekend naar totale minuten voor de planning.</p>
      </div>
      <div>
        <label>Einddatum</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Start Tijd</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="border rounded px-2 py-1 w-full" />
        </div>
        <div>
          <label>Eind Tijd</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="border rounded px-2 py-1 w-full" />
        </div>
      </div>
      <div>
        <label>Locatie</label>
        <input value={location} onChange={e => setLocation(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Max deelnemers</label>
        <input type="number" value={maxParticipants} onChange={e => setMaxParticipants(Number(e.target.value))} className="border rounded px-2 py-1 w-full" min={2} />
      </div>
      <div>
        <label>Inschrijfgeld (€)</label>
        <input type="number" value={entryFee} onChange={e => setEntryFee(Number(e.target.value))} className="border rounded px-2 py-1 w-full" min={0} step={0.01} />
      </div>
      <div>
        <label>Inschrijfdeadline</label>
        <input type="date" value={registrationDeadline} onChange={e => setRegistrationDeadline(e.target.value)} className="border rounded px-2 py-1 w-full" />
      </div>
      <div>
        <label>Match Duur (minuten)</label>
        <input type="number" value={matchDuration} onChange={e => setMatchDuration(Number(e.target.value))} className="border rounded px-2 py-1 w-full" min={15} step={5} />
        <span className="text-xs text-gray-500">Geschatte duur van één wedstrijd</span>
      </div>
      <div>
        <label>Rusttijd (minuten)</label>
        <input type="number" value={breakTime} onChange={e => setBreakTime(Number(e.target.value))} className="border rounded px-2 py-1 w-full" min={0} step={1} />
        <span className="text-xs text-gray-500">Tijd tussen wedstrijden</span>
      </div>
      <div>
        <label>Beschikbare Banen</label>
        <input type="number" value={availableCourts} onChange={e => setAvailableCourts(Number(e.target.value))} className="border rounded px-2 py-1 w-full" min={1} step={1} />
        <span className="text-xs text-gray-500">Aantal banen voor parallelle wedstrijden</span>
      </div>
      
      {/* Schedule Calculation Panel */}
      <div className={`border-2 rounded-xl p-4 ${
        timeCalc.difference >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
      }`}>
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          {timeCalc.difference >= 0 ? (
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className={timeCalc.difference >= 0 ? 'text-green-800' : 'text-red-800'}>
            Tijdschema Berekening
          </span>
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Geschatte wedstrijden ({format}):</span>
            <span className="font-semibold">{timeCalc.matches} ({timeCalc.rounds} rondes op {timeCalc.courts} {timeCalc.courts === 1 ? 'baan' : 'banen'})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Beschikbare tijd:</span>
            <span className="font-semibold">{Math.floor(timeCalc.availableMinutes / 60)}u {timeCalc.availableMinutes % 60}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Benodigde tijd:</span>
            <span className="font-semibold">{Math.floor(timeCalc.totalNeeded / 60)}u {timeCalc.totalNeeded % 60}m</span>
          </div>
          <div className="border-t pt-2 mt-2">
            {timeCalc.difference >= 0 ? (
              <div className="text-green-700">
                <span className="font-semibold">✓ Past binnen tijdschema</span>
                <p className="text-xs mt-1">Er blijft {timeCalc.hours}u {timeCalc.minutes}m over voor pauzes/buffers</p>
              </div>
            ) : (
              <div className="text-red-700">
                <span className="font-semibold">⚠ Overschrijding: {timeCalc.hours}u {timeCalc.minutes}m</span>
                <div className="mt-2 p-2 bg-white rounded border border-red-200">
                  <p className="text-xs font-semibold mb-1">💡 Aanbevolen aanpassing:</p>
                  <p className="text-xs">Match duur: <strong>{timeCalc.suggestedMatchDuration} min</strong></p>
                  <p className="text-xs">Rusttijd: <strong>{timeCalc.suggestedBreakTime} min</strong></p>
                  <button 
                    type="button"
                    onClick={() => {
                      setMatchDuration(timeCalc.suggestedMatchDuration);
                      setBreakTime(timeCalc.suggestedBreakTime);
                    }}
                    className="mt-2 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Pas toe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feasible Formats Display */}
      {feasibleFormats.length > 0 && (
        <div className="border-2 rounded-xl p-4 bg-blue-50 border-blue-300">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-blue-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Mogelijke Toernooiformaten
          </h4>
          
          <div className="space-y-2">
            {feasibleFormats.map((fmt) => (
              <div
                key={fmt.name}
                className={`p-3 rounded-lg border-2 transition-all ${
                  fmt.name === format
                    ? 'bg-blue-100 border-blue-500 shadow-md'
                    : fmt.fits
                    ? 'bg-white border-green-400 hover:shadow-sm'
                    : 'bg-gray-50 border-gray-300 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${fmt.fits ? 'text-green-600' : 'text-red-500'}`}>
                      {fmt.fits ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        {fmt.label}
                        {fmt.name === format && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                            Geselecteerd
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {fmt.matches} wedstrijden • {Math.floor(fmt.totalNeeded / 60)}u {fmt.totalNeeded % 60}m benodigd
                        {fmt.fits
                          ? ` • ${Math.floor(fmt.difference / 60)}u ${fmt.difference % 60}m over`
                          : ` • ${Math.floor(Math.abs(fmt.difference) / 60)}u ${Math.abs(fmt.difference) % 60}m tekort`
                        }
                      </p>
                    </div>
                  </div>
                  {fmt.name !== format && (
                    <button
                      type="button"
                      onClick={() => setFormat(fmt.name as any)}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        fmt.fits 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      Selecteer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-600 mt-3 flex items-start gap-1">
            <span>💡</span>
            <span>Groene vinkjes tonen welke formaten binnen de beschikbare tijd passen. Klik op "Selecteer" om snel te wisselen.</span>
          </p>
        </div>
      )}
      
      <div>
        <label>Scoring format</label>
        <select value={scoringFormat} onChange={e => setScoringFormat(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="standard">Standaard</option>
          <option value="no-ad">No-ad</option>
          <option value="fast4">Fast4</option>
        </select>
      </div>
      <div>
        <label>Tie-breaker</label>
        <select value={tieBreaker} onChange={e => setTieBreaker(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="none">Geen</option>
          <option value="classic">Classic</option>
          <option value="super">Super tie-break</option>
        </select>
      </div>
      <div>
        <label>Win by</label>
        <input type="number" value={winBy} onChange={e => setWinBy(Number(e.target.value))} className="border rounded px-2 py-1 w-full" min={1} />
      </div>
      <div>
        <label>Sets</label>
        <input type="number" value={sets} onChange={e => setSets(Number(e.target.value))} className="border rounded px-2 py-1 w-full" min={1} />
      </div>
      <div>
        <label>Consolatie ronde</label>
        <input type="checkbox" checked={hasConsolation} onChange={e => setHasConsolation(e.target.checked)} className="mr-2 leading-tight" />
        <span className="text-sm">Ja, voeg een troostronde toe voor deelnemers die verliezen in de eerste ronde</span>
      </div>
      <div>
        <label>Bronze Match</label>
        <input type="checkbox" checked={hasBronzeMatch} onChange={e => setHasBronzeMatch(e.target.checked)} className="mr-2 leading-tight" />
        <span className="text-sm">Ja, voeg een bronze match toe voor de verliezer van de finale</span>
      </div>
      <div>
        <label>Beschrijving</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="border rounded px-2 py-1 w-full" rows={3} />
      </div>

      {/* Temporary Players Section - Only show when editing */}
      {initial && (
        <div className="border-t-2 pt-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Tijdelijke Spelers</h3>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Ingeschreven leden:</span>
                  <p className="font-bold text-lg">{enrolledCount}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tijdelijke spelers:</span>
                  <p className="font-bold text-lg">{tempPlayerCount}</p>
                </div>
                <div>
                  <span className="text-gray-600">Totaal:</span>
                  <p className="font-bold text-lg">{totalParticipants}</p>
                </div>
                <div>
                  <span className="text-gray-600">Nog beschikbaar:</span>
                  <p className={`font-bold text-lg ${remainingSpots === 0 ? 'text-red-500' : 'text-green-500'}`}>{remainingSpots}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Maximaal toegestaan: {maxParticipants} deelnemers
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTempPlayerSection(!showTempPlayerSection)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ml-4 whitespace-nowrap flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${showTempPlayerSection ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Bewerk
            </button>
          </div>

          {showTempPlayerSection && (
            <div className="space-y-4">
              {showTempPlayerForm && (
                <div className="border border-gray-200 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white shadow-sm mb-4">
                  <h4 className="font-semibold text-gray-800 mb-4 text-base">Voeg tijdelijke speler toe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Naam</label>
                      <input
                        type="text"
                        placeholder="Voer naam in"
                        value={tempPlayerForm.name}
                        onChange={e => setTempPlayerForm({ ...tempPlayerForm, name: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Geslacht</label>
                      <select
                        value={tempPlayerForm.gender}
                        onChange={e => setTempPlayerForm({ ...tempPlayerForm, gender: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="M">Man</option>
                        <option value="V">Vrouw</option>
                        <option value="X">Overig</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Niveau</label>
                      <select
                        value={tempPlayerForm.level}
                        onChange={e => setTempPlayerForm({ ...tempPlayerForm, level: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Gemiddeld</option>
                        <option value="advanced">Gevorderd</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">DUPR Rating</label>
                      <input
                        type="number"
                        placeholder="0.0 - 8.0"
                        step="0.1"
                        min="0"
                        max="8"
                        value={tempPlayerForm.duprRating}
                        onChange={e => setTempPlayerForm({ ...tempPlayerForm, duprRating: parseFloat(e.target.value) })}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Leeftijd</label>
                      <input
                        type="number"
                        placeholder="Voer leeftijd in"
                        min="1"
                        max="120"
                        value={tempPlayerForm.age}
                        onChange={e => setTempPlayerForm({ ...tempPlayerForm, age: e.target.value })}
                        className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={addTemporaryPlayer}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Toevoegen
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTempPlayerForm(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              {!showTempPlayerForm && (
                <button
                  type="button"
                  onClick={() => setShowTempPlayerForm(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium mb-4 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Voeg tijdelijke speler toe
                </button>
              )}

              {temporaryPlayers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Toegevoegde spelers</h4>
                  {temporaryPlayers.map((player: any) => (
                    <div key={player.id} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Naam</label>
                          <input
                            type="text"
                            value={player.name}
                            onChange={e => updateTemporaryPlayer(player.id, { name: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Naam"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Geslacht</label>
                          <select
                            value={player.gender}
                            onChange={e => updateTemporaryPlayer(player.id, { gender: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="M">Man</option>
                            <option value="V">Vrouw</option>
                            <option value="X">Overig</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Niveau</label>
                          <select
                            value={player.level}
                            onChange={e => updateTemporaryPlayer(player.id, { level: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Gemiddeld</option>
                            <option value="advanced">Gevorderd</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">DUPR Rating</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="8"
                            value={player.duprRating}
                            onChange={e => updateTemporaryPlayer(player.id, { duprRating: parseFloat(e.target.value) })}
                            className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="DUPR Rating"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Leeftijd</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={player.age || ''}
                            onChange={e => updateTemporaryPlayer(player.id, { age: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Leeftijd"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeTemporaryPlayer(player.id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Verwijder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2">Opslaan</button>
        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 rounded px-4 py-2">Annuleren</button>
      </div>
    </form>
  );
}
