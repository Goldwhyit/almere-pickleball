import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentAPI } from '../../lib/tournamentApi';
import TournamentForm from './TournamentForm';
import { createMatch, getMatches, updateMatch } from '../../lib/matchApi';
import { memberAPI } from '../../lib/memberApi';


export default function TournamentsList() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTournament, setEditTournament] = useState<any>(null);
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [team1Player1, setTeam1Player1] = useState('');
  const [team2Player1, setTeam2Player1] = useState('');
  const [team1Player2, setTeam1Player2] = useState('');
  const [team2Player2, setTeam2Player2] = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [usedPlayerIds, setUsedPlayerIds] = useState<string[]>([]);
  const [usedCourtNumbers, setUsedCourtNumbers] = useState<number[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsTournament, setResultsTournament] = useState<any>(null);
  const [tournamentMatches, setTournamentMatches] = useState<any[]>([]);
  const [scoreEditId, setScoreEditId] = useState<string | null>(null);
  const [scoreForm, setScoreForm] = useState<any>({ team1Score: '', team2Score: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // New states for temporary players and pairings
  const [tempPlayers, setTempPlayers] = useState<any[]>([]);
  const [showTempPlayerForm, setShowTempPlayerForm] = useState(false);
  const [tempPlayerForm, setTempPlayerForm] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    level: 'intermediate',
    duprRating: '3.0'
  });
  const [pairings, setPairings] = useState<[string, string][]>([]);
  const [remixMode, setRemixMode] = useState(false);

  const getFormatLabel = (format: string) => {
    const formatMap: Record<string, string> = {
      ROUND_ROBIN: 'Round Robin',
      SINGLE_ELIMINATION: 'Single Elimination',
      DOUBLE_ELIMINATION: 'Double Elimination',
      LEAGUE: 'League',
      LADDER: 'Ladder'
    };
    return formatMap[format] || format;
  };

  // Implementeer benodigde functies
  const fetchMembers = async () => {
    try {
      const data = await memberAPI.getAll();
      console.log('Opgehaalde members:', data);
      setMembers(data?.members || []);
    } catch (err) {
      console.error('Fout bij laden members:', err);
    }
  };

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await tournamentAPI.getAll();
      console.log('Opgehaalde toernooien:', data);
      setTournaments(data || []);
      setError('');
    } catch (err: any) {
      console.error('Fout bij laden toernooien:', err);
      setError('Fout bij laden toernooien');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tournamentAPI.remove(id);
      setShowDeleteConfirm(null);
      setToast({ message: 'Toernooi succesvol verwijderd!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      fetchTournaments();
    } catch (err) {
      setShowDeleteConfirm(null);
      setToast({ message: 'Verwijderen mislukt', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleScoreEdit = (match: any) => {
    setScoreEditId(match.id);
    setScoreForm({
      team1Score: match.sets && match.sets[0] ? match.sets[0].team1Score : '',
      team2Score: match.sets && match.sets[0] ? match.sets[0].team2Score : '',
    });
  };

  const handleScoreSave = async (match: any) => {
    try {
      const team1Score = Number(scoreForm.team1Score);
      const team2Score = Number(scoreForm.team2Score);
      
      if (isNaN(team1Score) || isNaN(team2Score)) {
        setToast({ message: 'Voer geldige scores in', type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      // Determine winner
      const winnerTeam = team1Score > team2Score ? 1 : team1Score < team2Score ? 2 : null;
      
      await updateMatch(match.id, {
        sets: [{
          setNumber: 1,
          team1Score,
          team2Score,
        }],
        status: 'COMPLETED',
        winnerTeam,
      });
      
      setScoreEditId(null);
      await fetchTournamentMatches(match.tournamentId);
      setToast({ message: 'Score succesvol opgeslagen!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error('Error saving score:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Onbekende fout';
      setToast({ message: `Opslaan mislukt: ${errorMsg}`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchMembers();
  }, []);

  // ESC key handlers for modals and navigation
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPlayerModal) {
          setShowPlayerModal(false);
        } else if (showResultsModal) {
          setShowResultsModal(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(null);
        } else if (showForm) {
          setShowForm(false);
          setEditTournament(null);
        } else {
          navigate('/dashboard');
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showPlayerModal, showResultsModal, showDeleteConfirm, showForm, navigate]);

  const fetchTournamentMatches = async (tournamentId: string) => {
    const response = await getMatches();
    const matches = response.data || [];
    console.log('Fetched matches for tournament:', matches);
    setTournamentMatches(matches.filter((m: any) => m.tournamentId === tournamentId));
  };

  const openResultsModal = async (tournament: any) => {
    setResultsTournament(tournament);
    setShowResultsModal(true);
    
    // Load temporary players from tournament data
    if (tournament.temporaryPlayers) {
      setTempPlayers(tournament.temporaryPlayers);
      console.log('✅ Loaded temporary players for results:', tournament.temporaryPlayers);
    } else {
      setTempPlayers([]);
    }
    
    await fetchTournamentMatches(tournament.id);
  };

  const openPlayerModal = async (tournament: any) => {
    setSelectedTournament(tournament);
    setShowPlayerModal(true);
    await fetchMembers();
    
    try {
      // Fetch all matches for this tournament to filter used players and courts
      const response = await getMatches();
      const allMatches = response.data || [];
      console.log('All matches from API:', allMatches);
      
      const tournamentMatchesData = allMatches.filter((m: any) => m.tournamentId === tournament.id);
      console.log('Matches for this tournament:', tournamentMatchesData);
      
      // Extract used player IDs
      const usedIds = new Set<string>();
      tournamentMatchesData.forEach((m: any) => {
        if (m.team1Player1Id) usedIds.add(m.team1Player1Id);
        if (m.team1Player2Id) usedIds.add(m.team1Player2Id);
        if (m.team2Player1Id) usedIds.add(m.team2Player1Id);
        if (m.team2Player2Id) usedIds.add(m.team2Player2Id);
      });
      const usedPlayerIdsArray = Array.from(usedIds);
      console.log('Used player IDs:', usedPlayerIdsArray);
      setUsedPlayerIds(usedPlayerIdsArray);
      
      // Extract used court numbers
      const usedCourts = tournamentMatchesData
        .map((m: any) => m.courtNumber)
        .filter((c: number) => c != null);
      console.log('Used court numbers:', usedCourts);
      setUsedCourtNumbers(usedCourts);

      // Auto-suggest players and court (editable by user)
      const tType = (tournament.type || '').toUpperCase();
      const isDoublesLike = tType.includes('DOUBLE') || tType.includes('MIXED');
      const availableCourtsList = [1,2,3,4,5,6,7,8];
      const suggestedCourt = availableCourtsList.find(c => !usedCourts.includes(c));

      const tournamentTempPlayers = tournament.temporaryPlayers || [];
      const allPlayers = [...members, ...tournamentTempPlayers];
      const availablePlayers = allPlayers.filter(p => p && p.id && !usedIds.has(p.id));

      if (isDoublesLike && availablePlayers.length >= 4) {
        setTeam1Player1(availablePlayers[0].id);
        setTeam1Player2(availablePlayers[1].id);
        setTeam2Player1(availablePlayers[2].id);
        setTeam2Player2(availablePlayers[3].id);
      } else if (!isDoublesLike && availablePlayers.length >= 2) {
        setTeam1Player1(availablePlayers[0].id);
        setTeam2Player1(availablePlayers[1].id);
        setTeam1Player2('');
        setTeam2Player2('');
      } else {
        setTeam1Player1('');
        setTeam2Player1('');
        setTeam1Player2('');
        setTeam2Player2('');
      }

      setCourtNumber(suggestedCourt ? String(suggestedCourt) : '');
      
      // Load existing pairings and temp players from tournament
      if (tournament.pairings) {
        setPairings(tournament.pairings);
      } else {
        setPairings([]);
      }
      if (tournament.temporaryPlayers) {
        setTempPlayers(tournament.temporaryPlayers);
      } else {
        setTempPlayers([]);
      }
    } catch (error) {
      console.error('❌ Error opening player modal:', error);
    }
  };

  const saveTournamentData = async () => {
    if (!selectedTournament) return;
    
    try {
      await tournamentAPI.update(selectedTournament.id, {
        pairings: pairings,
        temporaryPlayers: tempPlayers
      });
      console.log('✅ Tournament data saved:', { pairings, tempPlayers });
    } catch (error) {
      console.error('❌ Error saving tournament data:', error);
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedTournament) {
      console.log('❌ Auto-assign: geen toernooi geselecteerd');
      return;
    }
    
    console.log('🎲 Auto-assign gestart voor toernooi:', selectedTournament.name);
    console.log('Toernooi type:', selectedTournament.type);
    console.log('Pairings:', pairings);
    console.log('Remix Mode:', remixMode);
    
    const tournamentType = selectedTournament.type;
    let player1Id = '';
    let player2Id = '';
    let player3Id = '';
    let player4Id = '';
    let assignedPlayers: string[] = [];
    let assignedFromPairings = false;
    
    // Check if we should use pairings for DOUBLES or MIXED (only if not in remix mode)
    if ((tournamentType === 'DOUBLES' || tournamentType === 'MIXED') && pairings.length >= 2 && !remixMode) {
      console.log('✅ Gebruik vaste koppels voor match generatie');
      
      // Find available pairings (not used yet)
      const availablePairings = pairings.filter(pair => 
        !usedPlayerIds.includes(pair[0]) && !usedPlayerIds.includes(pair[1])
      );
      
      console.log('Beschikbare koppels:', availablePairings.length);
      
      if (availablePairings.length >= 2) {
        const [pair1, pair2] = availablePairings;
        player1Id = pair1[0];
        player2Id = pair1[1];
        player3Id = pair2[0];
        player4Id = pair2[1];
        
        assignedPlayers = [
          getPlayerName(pair1[0]),
          getPlayerName(pair1[1]),
          getPlayerName(pair2[0]),
          getPlayerName(pair2[1])
        ];
        assignedFromPairings = true;
        console.log('✅ Koppels toegewezen:', assignedPlayers);
      } else {
        setToast({ 
          message: 'Niet genoeg beschikbare koppels, huidige selectie wordt gebruikt', 
          type: 'info' 
        });
        setTimeout(() => setToast(null), 3000);
        console.log('ℹ️ Valt terug op individuele toewijzing');
      }
    }

    if (!assignedFromPairings) {
      // Remix mode OR no pairings: random assignment with individual players
      if (remixMode) {
        console.log('🔀 Remix Mode actief: koppels worden opnieuw geshuffled');
      } else {
        console.log('🔀 Gebruik willekeurige toewijzing (geen koppels)');
      }
      const availableMembers = members.filter(m => !usedPlayerIds.includes(m.id));
      const availableTempPlayers = tempPlayers.filter(tp => !usedPlayerIds.includes(tp.id));
      const allAvailablePlayers = [...availableMembers, ...availableTempPlayers];
      
      const minPlayers = tournamentType === 'SINGLES' ? 2 : 4;
      if (allAvailablePlayers.length < minPlayers) {
        setToast({ 
          message: `Niet genoeg beschikbare spelers (minimaal ${minPlayers} nodig)`, 
          type: 'error' 
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      const shuffled = [...allAvailablePlayers].sort(() => Math.random() - 0.5);
      
      if (tournamentType === 'SINGLES') {
        player1Id = shuffled[0].id;
        player3Id = shuffled[1].id;
        assignedPlayers = [
          shuffled[0].firstName ? `${shuffled[0].firstName} ${shuffled[0].lastName}` : shuffled[0].name,
          shuffled[1].firstName ? `${shuffled[1].firstName} ${shuffled[1].lastName}` : shuffled[1].name
        ];
      } else if (tournamentType === 'MIXED') {
        const males = shuffled.filter(p => p.gender === 'MALE' || p.gender === 'M');
        const females = shuffled.filter(p => p.gender === 'FEMALE' || p.gender === 'F');
        
        if (males.length >= 2 && females.length >= 2) {
          player1Id = males[0].id;
          player2Id = females[0].id;
          player3Id = males[1].id;
          player4Id = females[1].id;
          assignedPlayers = [
            males[0].firstName ? `${males[0].firstName} ${males[0].lastName}` : males[0].name,
            females[0].firstName ? `${females[0].firstName} ${females[0].lastName}` : females[0].name,
            males[1].firstName ? `${males[1].firstName} ${males[1].lastName}` : males[1].name,
            females[1].firstName ? `${females[1].firstName} ${females[1].lastName}` : females[1].name
          ];
        } else {
          player1Id = shuffled[0].id;
          player2Id = shuffled[1].id;
          player3Id = shuffled[2].id;
          player4Id = shuffled[3].id;
          assignedPlayers = shuffled.slice(0, 4).map(p => p.firstName ? `${p.firstName} ${p.lastName}` : p.name);
        }
      } else {
        // Doubles
        player1Id = shuffled[0].id;
        player2Id = shuffled[1].id;
        player3Id = shuffled[2].id;
        player4Id = shuffled[3].id;
        assignedPlayers = shuffled.slice(0, 4).map(p => p.firstName ? `${p.firstName} ${p.lastName}` : p.name);
      }
    }
    
    // Auto-assign first available court
    const availableCourts = [1, 2, 3, 4, 5, 6, 7, 8].filter(c => !usedCourtNumbers.includes(c));
    const assignedCourt = availableCourts.length > 0 ? availableCourts[0] : null;
    
    // Create match immediately
    try {
      const matchData: any = {
        tournamentId: selectedTournament.id,
        roundNumber: 1,
        matchNumber: 1,
        roundName: 'Eerste ronde',
        team1Player1Id: player1Id,
        team2Player1Id: player3Id,
        status: 'SCHEDULED',
        scheduledDatetime: new Date().toISOString(),
      };
      
      // Add optional fields ONLY if they have valid values
      if (assignedCourt) {
        matchData.courtNumber = assignedCourt;
      }
      
      // Add player2 fields for doubles/mixed ONLY if they exist
      if (player2Id) {
        matchData.team1Player2Id = player2Id;
      }
      if (player4Id) {
        matchData.team2Player2Id = player4Id;
      }
      
      console.log('🔄 Match wordt aangemaakt...', matchData);
      const response = await createMatch(matchData);
      console.log('✅ Match succesvol aangemaakt:', response.data);
      
      // Update used players and courts
      const newUsedPlayers = [player1Id, player3Id];
      if (player2Id) newUsedPlayers.push(player2Id);
      if (player4Id) newUsedPlayers.push(player4Id);
      setUsedPlayerIds([...usedPlayerIds, ...newUsedPlayers]);
      
      if (assignedCourt) {
        setUsedCourtNumbers([...usedCourtNumbers, assignedCourt]);
      }
      
      const playerNames = assignedPlayers.join(', ');
      setToast({ 
        message: `Match toegevoegd! ${playerNames}${assignedCourt ? ` | Baan ${assignedCourt}` : ''}`, 
        type: 'success' 
      });
      setTimeout(() => setToast(null), 4000);
      
      fetchTournaments();
      console.log('✅ Auto-assign en match aanmaken voltooid');
    } catch (err: any) {
      console.error('❌ Fout bij aanmaken match:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Onbekende fout';
      setToast({ message: `Fout bij aanmaken match: ${errorMsg}`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleGenerateMatch = async () => {
    if (!selectedTournament) return;
    try {
      const matchData: any = {
        tournamentId: selectedTournament.id,
        roundNumber: 1,
        matchNumber: 1,
        roundName: 'Eerste ronde',
        team1Player1Id: team1Player1,
        team2Player1Id: team2Player1,
        courtNumber: courtNumber ? Number(courtNumber) : null,
        status: 'SCHEDULED',
        scheduledDatetime: new Date().toISOString(),
      };
      
      // Add player2 fields for doubles/mixed
      const isDoublesLike = selectedTournament?.type?.includes('DOUBLES') || selectedTournament?.type?.includes('MIXED');
      if (isDoublesLike) {
        matchData.team1Player2Id = team1Player2;
        matchData.team2Player2Id = team2Player2;
      }
      
      const response = await createMatch(matchData);
      console.log('Match created:', response.data);
      
      // Don't close modal - keep it open for next match
      setToast({ message: 'Match toegevoegd!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
      
      // Update used players and courts
      const newUsedPlayers = [team1Player1, team2Player1];
      if (team1Player2) newUsedPlayers.push(team1Player2);
      if (team2Player2) newUsedPlayers.push(team2Player2);
      const nextUsedPlayers = Array.from(new Set([...usedPlayerIds, ...newUsedPlayers]));
      setUsedPlayerIds(nextUsedPlayers);
      
      const nextUsedCourts = courtNumber
        ? Array.from(new Set([...usedCourtNumbers, Number(courtNumber)]))
        : usedCourtNumbers;
      if (courtNumber) {
        setUsedCourtNumbers(nextUsedCourts);
      }
      
      // Auto-suggest next match immediately after adding one
      const tType = (selectedTournament.type || '').toUpperCase();
      const isDoublesLikeNext = tType.includes('DOUBLE') || tType.includes('MIXED');
      const availableCourtsList = [1, 2, 3, 4, 5, 6, 7, 8];
      const suggestedCourt = availableCourtsList.find(c => !nextUsedCourts.includes(c));
      const tournamentTempPlayers = selectedTournament.temporaryPlayers || [];
      const allPlayers = [...members, ...tournamentTempPlayers];
      const availablePlayers = allPlayers.filter(p => p && p.id && !nextUsedPlayers.includes(p.id));
      
      if (isDoublesLikeNext && availablePlayers.length >= 4) {
        setTeam1Player1(availablePlayers[0].id);
        setTeam1Player2(availablePlayers[1].id);
        setTeam2Player1(availablePlayers[2].id);
        setTeam2Player2(availablePlayers[3].id);
      } else if (!isDoublesLikeNext && availablePlayers.length >= 2) {
        setTeam1Player1(availablePlayers[0].id);
        setTeam2Player1(availablePlayers[1].id);
        setTeam1Player2('');
        setTeam2Player2('');
      } else {
        setTeam1Player1('');
        setTeam2Player1('');
        setTeam1Player2('');
        setTeam2Player2('');
      }
      setCourtNumber(suggestedCourt ? String(suggestedCourt) : '');
      
      fetchTournaments();
    } catch (err: any) {
      console.error('Fout bij aanmaken match:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Onbekende fout';
      setToast({ message: `Fout: ${errorMsg}`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  // New functions for temporary players
  const handleAddTempPlayer = async () => {
    if (!tempPlayerForm.name.trim()) {
      setToast({ message: 'Naam is verplicht', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const tempPlayerId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newTempPlayer = {
      id: tempPlayerId,
      ...tempPlayerForm,
      age: Number(tempPlayerForm.age),
      duprRating: parseFloat(tempPlayerForm.duprRating),
      isTemporary: true
    };

    setTempPlayers([...tempPlayers, newTempPlayer]);
    setTempPlayerForm({
      name: '',
      age: '',
      gender: 'MALE',
      level: 'intermediate',
      duprRating: '3.0'
    });
    setShowTempPlayerForm(false);
    setToast({ message: `Tijdelijke speler ${newTempPlayer.name} toegevoegd!`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
    
    // Save to database
    await saveTournamentData();
  };

  const handleRemoveTempPlayer = async (id: string) => {
    setTempPlayers(tempPlayers.filter(p => p.id !== id));
    setToast({ message: 'Tijdelijke speler verwijderd', type: 'success' });
    setTimeout(() => setToast(null), 2000);
    
    // Save to database
    await saveTournamentData();
  };

  // New functions for pairings
  const handleCreatePairings = async () => {
    if (!selectedTournament || (selectedTournament.type !== 'DOUBLES' && selectedTournament.type !== 'MIXED')) {
      setToast({ message: 'Koppels zijn alleen voor doubles/mixed toernooien', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Get all available players (members + temp players)
    const allPlayers = [...members, ...tempPlayers];
    const availablePlayers = allPlayers.filter(p => !usedPlayerIds.includes(p.id));

    if (availablePlayers.length < 2) {
      setToast({ message: 'Niet genoeg spelers voor koppels', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Create pairs automatically or let user create them manually
    const newPairings: [string, string][] = [];
    const shuffled = [...availablePlayers].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      newPairings.push([shuffled[i].id, shuffled[i + 1].id]);
    }

    setPairings(newPairings);
    
    // Save to database
    await saveTournamentData();
  };

  const handleRemovePairing = async (index: number) => {
    setPairings(pairings.filter((_, i) => i !== index));
    
    // Save to database
    await saveTournamentData();
  };

  const getPlayerName = (playerId: string) => {
    const member = members.find(m => m.id === playerId);
    if (member) return `${member.firstName} ${member.lastName}`;
    
    const tempPlayer = tempPlayers.find(tp => tp.id === playerId);
    if (tempPlayer) return `${tempPlayer.name} (Gast)`;
    
    return 'Onbekend';
  };

  return (
    <div className="p-6 max-h-screen overflow-y-auto relative">
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
        aria-label="Sluiten"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="flex justify-between items-center mb-6 pr-12">
        <h1 className="text-2xl font-bold text-primary-700">Toernooien</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-semibold"
          onClick={() => setShowForm(true)}
        >
          + Nieuw Toernooi
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {showForm && (
        <div className="mb-6">
          <TournamentForm
            tournament={editTournament}
            onClose={() => {
              setShowForm(false);
              setEditTournament(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setEditTournament(null);
              fetchTournaments();
            }}
          />
        </div>
      )}

      {editTournament && !showForm && (
        <div className="mb-6">
          <TournamentForm
            tournament={editTournament}
            onClose={() => setEditTournament(null)}
            onSuccess={() => {
              setEditTournament(null);
              fetchTournaments();
            }}
          />
        </div>
      )}

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex gap-4" role="tablist">
          <button
            id="tab-active"
            role="tab"
            aria-selected={tab === 'active'}
            aria-controls="tabpanel-active"
            className={`px-4 py-2 font-semibold ${
              tab === 'active'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
            }`}
            onClick={() => setTab('active')}
          >
            Actieve Toernooien
          </button>
          <button
            id="tab-past"
            role="tab"
            aria-selected={tab === 'past'}
            aria-controls="tabpanel-past"
            className={`px-4 py-2 font-semibold ${
              tab === 'past'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-primary-600'
            }`}
            onClick={() => setTab('past')}
          >
            Afgelopen Toernooien
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Laden...</div>
      ) : (
        <div
          role="tabpanel"
          id={tab === 'active' ? 'tabpanel-active' : 'tabpanel-past'}
          aria-labelledby={tab === 'active' ? 'tab-active' : 'tab-past'}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6"
        >
        {(() => {
          const filtered = tournaments.filter(t => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endDate = new Date(t.endDate);
            endDate.setHours(0, 0, 0, 0);
            const isActive = endDate >= today;
            console.log(`Toernooi ${t.name}: endDate=${t.endDate}, isActive=${isActive}`);
            return tab === 'active' ? isActive : !isActive;
          });
          console.log(`${tab} toernooien (gefilterd):`, filtered);
          return filtered;
        })().map(t => (
            <div
              key={t.id}
              className="rounded-2xl shadow-lg border-2 border-primary-200 bg-white hover:shadow-primary-200 transition-all p-6 flex flex-col min-h-[260px] h-full"
              style={{ boxSizing: 'border-box' }}
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xl font-bold text-primary-700 mb-1 truncate break-words max-w-full" title={t.name}>{t.name}</div>
                  <div className="text-sm text-gray-600 mb-2 break-words max-w-full whitespace-normal">
                    {t.type} | {getFormatLabel(t.format)} | {t.status} | {new Date(t.startDate).toLocaleDateString()}
                  </div>
                  {t.minSkillLevel && (
                    <div className="text-xs text-gray-500 mb-2">Niveau: {t.minSkillLevel}</div>
                  )}
                  {(t.matchDuration || t.breakTime) && (
                    <div className="text-xs text-gray-500 mb-2">
                      Match: {t.matchDuration || 45}min | Rust: {t.breakTime || 15}min
                    </div>
                  )}
                  {t.registrations && t.registrations.length > 0 && (
                    <div className="mt-2 text-sm">
                      <div className="font-semibold mb-1">Ingeschreven leden:</div>
                      <ul className="list-disc ml-5">
                        {t.registrations.map((r: any) => (
                          <li key={r.id} className="break-words max-w-full whitespace-normal">
                            {r.player1?.firstName} {r.player1?.lastName}
                            {r.player2 ? ` & ${r.player2.firstName} ${r.player2.lastName}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row flex-wrap gap-2 mt-6 w-full">
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-full text-sm font-semibold flex-1 min-w-[120px] transition-all shadow-md" onClick={() => navigate(`/tournaments/${t.id}`)}>
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Bekijk Details
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex-1 min-w-[120px]" onClick={() => setEditTournament(t)}>Bewerken</button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex-1 min-w-[120px]" onClick={() => setShowDeleteConfirm(t.id)}>Verwijderen</button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex-1 min-w-[120px]" onClick={() => openPlayerModal(t)}>
                  Genereer wedstrijden
                </button>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex-1 min-w-[120px]" onClick={() => openResultsModal(t)}>
                  Uitslagen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showPlayerModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 relative">
              <button
                onClick={() => setShowPlayerModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                aria-label="Sluiten"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-white">Wedstrijden Aanmaken</h3>
              <p className="text-primary-100 mt-1">Selecteer spelers en baan voor dit toernooi</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Auto-assign button */}
              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-primary-900">Automatisch toewijzen</p>
                    <p className="text-sm text-primary-700">Laat het systeem willekeurig spelers en een baan kiezen</p>
                  </div>
                  <button 
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    onClick={handleAutoAssign}
                    type="button"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Auto-toewijzen
                  </button>
                </div>
                
                {/* Remix Mode Toggle for Doubles/Mixed */}
                {selectedTournament && (selectedTournament.type === 'DOUBLES' || selectedTournament.type === 'MIXED') && pairings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-primary-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={remixMode}
                        onChange={(e) => setRemixMode(e.target.checked)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <div>
                        <span className="font-semibold text-primary-900">🔀 Remix Mode</span>
                        <p className="text-xs text-primary-600">Negeer vaste koppels en shuffle individuele spelers (voor halve finale/finale)</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              
              {/* Temporary Players Section */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-blue-900">Tijdelijke Spelers (Gasten)</p>
                    <p className="text-sm text-blue-700">Voeg gastspelers toe voor dit toernooi</p>
                  </div>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm"
                    onClick={() => setShowTempPlayerForm(!showTempPlayerForm)}
                    type="button"
                  >
                    {showTempPlayerForm ? 'Annuleren' : '+ Toevoegen'}
                  </button>
                </div>

                {showTempPlayerForm && (
                  <div className="bg-white rounded-lg p-4 space-y-3 mb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Naam *</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={tempPlayerForm.name}
                          onChange={e => setTempPlayerForm({...tempPlayerForm, name: e.target.value})}
                          placeholder="Voor- en achternaam"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Leeftijd</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={tempPlayerForm.age}
                          onChange={e => setTempPlayerForm({...tempPlayerForm, age: e.target.value})}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Geslacht</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={tempPlayerForm.gender}
                          onChange={e => setTempPlayerForm({...tempPlayerForm, gender: e.target.value})}
                        >
                          <option value="MALE">Man</option>
                          <option value="FEMALE">Vrouw</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Niveau</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={tempPlayerForm.level}
                          onChange={e => setTempPlayerForm({...tempPlayerForm, level: e.target.value})}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Gevorderd</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">DUPR Rating</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          value={tempPlayerForm.duprRating}
                          onChange={e => setTempPlayerForm({...tempPlayerForm, duprRating: e.target.value})}
                          placeholder="3.0"
                        />
                      </div>
                    </div>
                    <button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                      onClick={handleAddTempPlayer}
                      type="button"
                    >
                      Opslaan
                    </button>
                  </div>
                )}

                {tempPlayers.length > 0 && (
                  <div className="space-y-2">
                    {tempPlayers.map(tp => (
                      <div key={tp.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{tp.name} <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Gast</span></p>
                          <p className="text-xs text-gray-600">
                            {tp.gender === 'MALE' ? '♂' : '♀'} • Leeftijd: {tp.age || 'N/A'} • Niveau: {tp.level} • DUPR: {tp.duprRating}
                          </p>
                        </div>
                        <button 
                          className="text-red-500 hover:text-red-700 px-2"
                          onClick={() => handleRemoveTempPlayer(tp.id)}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {tempPlayers.length === 0 && !showTempPlayerForm && (
                  <p className="text-sm text-blue-600 text-center py-2">Nog geen gastspelers toegevoegd</p>
                )}
              </div>

              {/* Pairings Section for Doubles/Mixed */}
              {selectedTournament && (selectedTournament.type.includes('DOUBLES') || selectedTournament.type.includes('MIXED')) && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-purple-900">Vaste Koppels</p>
                      <p className="text-sm text-purple-700">Spelers die de hele avond samen spelen</p>
                    </div>
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all text-sm"
                      onClick={handleCreatePairings}
                      type="button"
                    >
                      Koppels Maken
                    </button>
                  </div>

                  {pairings.length > 0 && (
                    <div className="space-y-2">
                      {pairings.map((pair, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👥</span>
                            <p className="font-semibold text-sm">
                              {getPlayerName(pair[0])} & {getPlayerName(pair[1])}
                            </p>
                          </div>
                          <button 
                            className="text-red-500 hover:text-red-700 px-2"
                            onClick={() => handleRemovePairing(index)}
                            type="button"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {pairings.length === 0 && (
                    <p className="text-sm text-purple-600 text-center py-2">Nog geen koppels gemaakt</p>
                  )}
                </div>
              )}

              {/* Player Count Requirements Indicator */}
              {selectedTournament && (
                (() => {
                  const t = (selectedTournament.type || '').toUpperCase();
                  const isDoublesLike = t.includes('DOUBLE') || t.includes('MIXED');
                  const isSinglesLike = !isDoublesLike;
                  return (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-600 mb-1">FORMAAT</div>
                      <div className="text-lg font-bold text-gray-800">
                        {isSinglesLike ? 'Singles' : 'Doubles'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-600 mb-1">SPELERS PER TEAM</div>
                      <div className="text-2xl font-bold text-primary-600">
                        {isSinglesLike ? '1' : '2'}
                        <span className="text-gray-400 font-normal"> vs </span>
                        {isSinglesLike ? '1' : '2'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-blue-600 mb-1">TOTAAL</div>
                      <div className="text-lg font-bold text-gray-800">
                        {isSinglesLike ? '2 spelers' : '4 spelers'}
                      </div>
                    </div>
                  </div>
                </div>
                  );
                })()
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Team 1 Speler 1</label>
                  <select 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all" 
                    value={team1Player1} 
                    onChange={e => setTeam1Player1(e.target.value)}
                  >
                    <option value="">Selecteer een speler</option>
                    {members
                      .filter(m => !usedPlayerIds.includes(m.id) && m.id !== team1Player2 && m.id !== team2Player1 && m.id !== team2Player2)
                      .map((m: any) => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                    {tempPlayers
                      .filter(tp => !usedPlayerIds.includes(tp.id) && tp.id !== team1Player2 && tp.id !== team2Player1 && tp.id !== team2Player2)
                      .map(tp => (
                        <option key={tp.id} value={tp.id}>{tp.name} (Gast)</option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Team 2 Speler 1</label>
                  <select 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all" 
                    value={team2Player1} 
                    onChange={e => setTeam2Player1(e.target.value)}
                  >
                    <option value="">Selecteer een speler</option>
                    {members
                      .filter(m => !usedPlayerIds.includes(m.id) && m.id !== team1Player1 && m.id !== team1Player2 && m.id !== team2Player2)
                      .map((m: any) => (
                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                      ))}
                    {tempPlayers
                      .filter(tp => !usedPlayerIds.includes(tp.id) && tp.id !== team1Player1 && tp.id !== team1Player2 && tp.id !== team2Player2)
                      .map(tp => (
                        <option key={tp.id} value={tp.id}>{tp.name} (Gast)</option>
                      ))}
                  </select>
                </div>
              </div>
              
              {/* Show player 2 fields for doubles/mixed */}
              {(() => {
                const t = selectedTournament?.type ? selectedTournament.type.toUpperCase() : '';
                const isDoublesLike = t.includes('DOUBLE') || t.includes('MIXED');
                if (!isDoublesLike) return null;
                return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Team 1 Speler 2</label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all" 
                      value={team1Player2} 
                      onChange={e => setTeam1Player2(e.target.value)}
                    >
                      <option value="">Selecteer een speler</option>
                      {members
                        .filter(m => !usedPlayerIds.includes(m.id) && m.id !== team1Player1 && m.id !== team2Player1 && m.id !== team2Player2)
                        .map((m: any) => (
                          <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                      {tempPlayers
                        .filter(tp => !usedPlayerIds.includes(tp.id) && tp.id !== team1Player1 && tp.id !== team2Player1 && tp.id !== team2Player2)
                        .map(tp => (
                          <option key={tp.id} value={tp.id}>{tp.name} (Gast)</option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Team 2 Speler 2</label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all" 
                      value={team2Player2} 
                      onChange={e => setTeam2Player2(e.target.value)}
                    >
                      <option value="">Selecteer een speler</option>
                      {members
                        .filter(m => !usedPlayerIds.includes(m.id) && m.id !== team1Player1 && m.id !== team1Player2 && m.id !== team2Player1)
                        .map((m: any) => (
                          <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                        ))}
                      {tempPlayers
                        .filter(tp => !usedPlayerIds.includes(tp.id) && tp.id !== team1Player1 && tp.id !== team1Player2 && tp.id !== team2Player1)
                        .map(tp => (
                          <option key={tp.id} value={tp.id}>{tp.name} (Gast)</option>
                        ))}
                    </select>
                  </div>
                </div>
                );
              })()}
              
              {/* Player Selection Progress */}
              {selectedTournament && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                  {(() => {
                    const t = selectedTournament?.type ? selectedTournament.type.toUpperCase() : '';
                    const isDoublesLike = t.includes('DOUBLE') || t.includes('MIXED');
                    const selectedCount = isDoublesLike
                      ? [team1Player1, team1Player2, team2Player1, team2Player2].filter(Boolean).length
                      : [team1Player1, team2Player1].filter(Boolean).length;
                    const needed = isDoublesLike ? 4 : 2;
                    const label = isDoublesLike ? '2 spelers per team nodig' : '1 speler per team nodig';
                    return (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-semibold text-gray-700">Spelers geselecteerd</div>
                          <div className="text-sm font-bold text-primary-600">{`${selectedCount}/${needed}`}</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              selectedCount === needed ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${(selectedCount / needed) * 100}%`
                            }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {label}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Baan</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all" 
                  value={courtNumber} 
                  onChange={e => setCourtNumber(e.target.value)}
                >
                  <option value="">Selecteer een baan (optioneel)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].filter(c => !usedCourtNumbers.includes(c)).map(c => (
                    <option key={c} value={c}>Baan {c}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-between gap-3 border-t flex-shrink-0">
              <button 
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg" 
                onClick={() => setShowPlayerModal(false)} 
                type="button"
              >
                Klaar
              </button>
              <button 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleGenerateMatch} 
                disabled={(() => {
                  const t = selectedTournament?.type ? selectedTournament.type.toUpperCase() : '';
                  const isDoublesLike = t.includes('DOUBLE') || t.includes('MIXED');
                  if (!team1Player1 || !team2Player1) return true;
                  if (isDoublesLike && (!team1Player2 || !team2Player2)) return true;
                  return false;
                })()}
                type="button"
                title={
                  (() => {
                    const t = selectedTournament?.type ? selectedTournament.type.toUpperCase() : '';
                    const isDoublesLike = t.includes('DOUBLE') || t.includes('MIXED');
                    if (!team1Player1) return 'Selecteer Team 1 Speler 1';
                    if (!team2Player1) return 'Selecteer Team 2 Speler 1';
                    if (isDoublesLike && !team1Player2) return 'Selecteer Team 1 Speler 2';
                    if (isDoublesLike && !team2Player2) return 'Selecteer Team 2 Speler 2';
                    return 'Match toevoegen';
                  })()
                }
              >
                + Match Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
      {showResultsModal && resultsTournament && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 relative">
              <button
                onClick={() => setShowResultsModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                aria-label="Sluiten"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-white">Uitslagen & Scores</h3>
              <p className="text-yellow-100 mt-1">{resultsTournament.name}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {tournamentMatches.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 text-lg">Nog geen wedstrijden voor dit toernooi</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Match</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Team 1</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Team 2</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Score</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Actie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tournamentMatches.map((m: any, idx: number) => (
                        <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">#{idx + 1}</div>
                            {m.roundName && <div className="text-xs text-gray-500">{m.roundName}</div>}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {(() => {
                                if (!m.team1Player1Id) return 'Gast';
                                const member = members.find(mem => mem.id === m.team1Player1Id);
                                if (member) return member.firstName;
                                const temp = tempPlayers.find(tp => tp.id === m.team1Player1Id);
                                return temp ? `${temp.name} (Gast)` : 'Gast';
                              })()}
                              {m.team1Player2Id && (
                                <span> & {(() => {
                                  const member = members.find(mem => mem.id === m.team1Player2Id);
                                  if (member) return member.firstName;
                                  const temp = tempPlayers.find(tp => tp.id === m.team1Player2Id);
                                  return temp ? `${temp.name} (Gast)` : 'Gast';
                                })()}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {(() => {
                                if (!m.team2Player1Id) return 'Gast';
                                const member = members.find(mem => mem.id === m.team2Player1Id);
                                if (member) return member.firstName;
                                const temp = tempPlayers.find(tp => tp.id === m.team2Player1Id);
                                return temp ? `${temp.name} (Gast)` : 'Gast';
                              })()}
                              {m.team2Player2Id && (
                                <span> & {(() => {
                                  const member = members.find(mem => mem.id === m.team2Player2Id);
                                  if (member) return member.firstName;
                                  const temp = tempPlayers.find(tp => tp.id === m.team2Player2Id);
                                  return temp ? `${temp.name} (Gast)` : 'Gast';
                                })()}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {scoreEditId === m.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <input 
                                  type="number" 
                                  value={scoreForm.team1Score} 
                                  onChange={e => setScoreForm((f: any) => ({ ...f, team1Score: e.target.value }))} 
                                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-16 text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-200" 
                                  placeholder="0"
                                  min="0"
                                />
                                <span className="text-gray-500 font-bold">-</span>
                                <input 
                                  type="number" 
                                  value={scoreForm.team2Score} 
                                  onChange={e => setScoreForm((f: any) => ({ ...f, team2Score: e.target.value }))} 
                                  className="border-2 border-gray-300 rounded-lg px-3 py-2 w-16 text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-200" 
                                  placeholder="0"
                                  min="0"
                                />
                              </div>
                            ) : (
                              <div className="text-center">
                                {m.sets && m.sets[0] ? (
                                  <span className="text-lg font-bold text-gray-900">
                                    {m.sets[0].team1Score} - {m.sets[0].team2Score}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {scoreEditId === m.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg px-4 py-2 font-semibold transition-all shadow-md hover:shadow-lg" 
                                  onClick={() => handleScoreSave(m)}
                                >
                                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Opslaan
                                </button>
                                <button 
                                  className="bg-gray-400 hover:bg-gray-500 text-white rounded-lg px-4 py-2 font-semibold transition-all" 
                                  onClick={() => setScoreEditId(null)}
                                >
                                  Annuleren
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg px-4 py-2 font-semibold transition-all shadow-md hover:shadow-lg" 
                                onClick={() => handleScoreEdit(m)}
                              >
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Bewerk
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button 
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg" 
                onClick={() => setShowResultsModal(false)} 
                type="button"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div className={`rounded-2xl shadow-2xl p-4 min-w-[300px] border-2 ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-400' 
              : 'bg-gradient-to-r from-red-500 to-red-600 border-red-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className="text-white font-semibold flex-1">{toast.message}</p>
              <button 
                onClick={() => setToast(null)}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <h3 className="text-2xl font-bold text-white">Toernooi Verwijderen</h3>
              <p className="text-red-100 mt-1">Dit kan niet ongedaan worden gemaakt</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Weet je zeker dat je dit toernooi wilt verwijderen?</p>
                  <p className="text-gray-600 text-sm mt-1">Alle bijbehorende wedstrijden en scores worden ook verwijderd.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button 
                className="px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all" 
                onClick={() => setShowDeleteConfirm(null)}
                type="button"
              >
                Annuleren
              </button>
              <button 
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg" 
                onClick={() => handleDelete(showDeleteConfirm)}
                type="button"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
