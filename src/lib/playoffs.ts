import { Match, StandingEntry, Team } from './standings';

export function isSeed1(name?: string | null): boolean {
  if (!name) return false;
  const n = name.trim().toUpperCase();
  return (
    n === '1RO' ||
    n === '1º' ||
    n === '1°' ||
    n === '1ER' ||
    n === '1ERO' ||
    n.startsWith('1RO') ||
    n.startsWith('1º') ||
    n.startsWith('1°') ||
    n.startsWith('1ER')
  );
}

export function isSeed2(name?: string | null): boolean {
  if (!name) return false;
  const n = name.trim().toUpperCase();
  return (
    n === '2DO' ||
    n === '2º' ||
    n === '2°' ||
    n === '2' ||
    n.startsWith('2DO') ||
    n.startsWith('2º') ||
    n.startsWith('2°')
  );
}

export function isSeed3(name?: string | null): boolean {
  if (!name) return false;
  const n = name.trim().toUpperCase();
  return (
    n === '3ERO' ||
    n === '3RO' ||
    n === '3º' ||
    n === '3°' ||
    n.startsWith('3ERO') ||
    n.startsWith('3RO') ||
    n.startsWith('3º') ||
    n.startsWith('3°')
  );
}

export function isSeed4(name?: string | null): boolean {
  if (!name) return false;
  const n = name.trim().toUpperCase();
  return (
    n === '4TO' ||
    n === '4º' ||
    n === '4°' ||
    n.startsWith('4TO') ||
    n.startsWith('4º') ||
    n.startsWith('4°')
  );
}

export function isFinalistPlaceholder(name?: string | null): boolean {
  if (!name) return false;
  const n = name.trim().toUpperCase();
  return (
    n.includes('FINALISTA') ||
    n.includes('FINAL') ||
    n.startsWith('F1') ||
    n.startsWith('F2')
  );
}

export function isPlaceholderTeam(name?: string | null): boolean {
  if (!name) return true;
  return (
    isSeed1(name) ||
    isSeed2(name) ||
    isSeed3(name) ||
    isSeed4(name) ||
    isFinalistPlaceholder(name) ||
    name.trim().toUpperCase().startsWith('GANADOR')
  );
}

export interface PlayoffMatchView {
  id?: string;
  stage: 'semifinal_1' | 'semifinal_2' | 'final';
  title: string;
  seedHomeLabel: string;
  seedAwayLabel: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'pending' | 'finished';
  matchDate?: string;
  streamUrl?: string | null;
  isConfirmed: boolean; // Both teams are official teams (not placeholders)
  isProjected: boolean; // Derived from current standings
  winnerTeamId?: string | null;
  winnerTeamName?: string | null;
  isTie: boolean;
  match?: Match;
}

export interface PlayoffBracket {
  hasEnoughTeams: boolean;
  semifinal1: PlayoffMatchView;
  semifinal2: PlayoffMatchView;
  finalMatch: PlayoffMatchView;
  canGenerateFinal: boolean;
  champion: {
    teamId: string;
    teamName: string;
  } | null;
  playoffMatchIds: string[];
}

/**
 * Searches for a playoff match between two specific teams.
 * Regular season matches must NEVER be selected as playoff matches.
 */
export function findPlayoffMatchBetween(
  matches: Match[],
  teamAId?: string,
  teamBId?: string
): Match | undefined {
  if (!teamAId || !teamBId) return undefined;

  const matchesBetween = matches.filter(
    (m) =>
      (m.home_team_id === teamAId && m.away_team_id === teamBId) ||
      (m.home_team_id === teamBId && m.away_team_id === teamAId)
  );

  if (matchesBetween.length === 0) return undefined;

  // 1. If there is a pending match between them, that is the unplayed playoff match!
  const pendingMatch = matchesBetween.find((m) => m.status === 'pending');
  if (pendingMatch) return pendingMatch;

  // 2. If multiple matches exist between them, the latest one by date is the playoff match
  if (matchesBetween.length > 1) {
    return [...matchesBetween].sort(
      (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
    )[0];
  }

  // 3. If there is only 1 match between them and it is finished:
  // In a round-robin league, this is the regular season match, NOT a playoff match.
  return undefined;
}

/**
 * Searches for existing playoff matches in the database matches list.
 * CRITICAL: Regular season matches must NEVER be selected as playoff matches.
 */
export function detectPlayoffMatches(
  matches: Match[],
  standings: StandingEntry[]
): {
  sf1Match: Match | undefined;
  sf2Match: Match | undefined;
  finalMatch: Match | undefined;
} {
  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];
  const top4 = standings[3];

  const matchHas = (m: Match, testFn: (name?: string | null) => boolean) => {
    return testFn(m.home_team?.name) || testFn(m.away_team?.name);
  };

  // 1. Detect Semifinal 1 (1º vs 3º):
  // First, look for a match that explicitly contains a Seed 1 placeholder (1RO, 1º, etc.)
  let sf1Match = matches.find((m) => matchHas(m, isSeed1));

  // If no placeholder match exists, search for an assigned playoff match between top1 and top3
  if (!sf1Match && top1 && top3) {
    sf1Match = findPlayoffMatchBetween(matches, top1.teamId, top3.teamId);
  }

  // 2. Detect Semifinal 2 (2º vs 4º):
  // First, look for a match that explicitly contains a Seed 2 placeholder (2DO, 2º, etc.)
  let sf2Match = matches.find((m) => matchHas(m, isSeed2));

  // If no placeholder match exists, search for an assigned playoff match between top2 and top4
  if (!sf2Match && top2 && top4) {
    sf2Match = findPlayoffMatchBetween(matches, top2.teamId, top4.teamId);
  }

  // 3. Detect Gran Final:
  let finalMatch = matches.find((m) => matchHas(m, isFinalistPlaceholder));

  if (!finalMatch) {
    // If SF1 and SF2 have confirmed winners, look for a match between them
    const sf1WinnerId =
      sf1Match?.status === 'finished' && sf1Match.home_score !== null && sf1Match.away_score !== null
        ? sf1Match.home_score > sf1Match.away_score
          ? sf1Match.home_team_id
          : sf1Match.away_score > sf1Match.home_score
          ? sf1Match.away_team_id
          : null
        : null;

    const sf2WinnerId =
      sf2Match?.status === 'finished' && sf2Match.home_score !== null && sf2Match.away_score !== null
        ? sf2Match.home_score > sf2Match.away_score
          ? sf2Match.home_team_id
          : sf2Match.away_score > sf2Match.home_score
          ? sf2Match.away_team_id
          : null
        : null;

    if (sf1WinnerId && sf2WinnerId) {
      finalMatch = findPlayoffMatchBetween(matches, sf1WinnerId, sf2WinnerId);
    }

    if (!finalMatch) {
      // Find candidate pending match that is neither SF1 nor SF2
      const candidatePending = matches
        .filter((m) => m.id !== sf1Match?.id && m.id !== sf2Match?.id && m.status === 'pending')
        .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
      if (candidatePending.length > 0) {
        finalMatch = candidatePending[0];
      }
    }
  }

  return { sf1Match, sf2Match, finalMatch };
}

/**
 * Builds the complete playoff bracket view according to current standings and DB matches.
 */
export function calculatePlayoffBracket(
  standings: StandingEntry[],
  matches: Match[]
): PlayoffBracket {
  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];
  const top4 = standings[3];

  const hasEnoughTeams = standings.length >= 4;
  const { sf1Match, sf2Match, finalMatch } = detectPlayoffMatches(matches, standings);

  // Helper to resolve winner of a match
  const resolveWinner = (m?: Match) => {
    if (!m || m.status !== 'finished' || m.home_score === null || m.away_score === null) {
      return { winnerId: null, winnerName: null, isTie: false };
    }
    if (m.home_score > m.away_score) {
      return {
        winnerId: m.home_team_id,
        winnerName: m.home_team?.name || 'Local',
        isTie: false,
      };
    }
    if (m.away_score > m.home_score) {
      return {
        winnerId: m.away_team_id,
        winnerName: m.away_team?.name || 'Visitante',
        isTie: false,
      };
    }
    return { winnerId: null, winnerName: null, isTie: true };
  };

  // Semifinal 1 (1º vs 3º)
  const sf1Winner = resolveWinner(sf1Match);
  const sf1IsConfirmed = Boolean(
    sf1Match &&
      !isPlaceholderTeam(sf1Match.home_team?.name) &&
      !isPlaceholderTeam(sf1Match.away_team?.name)
  );

  const semifinal1: PlayoffMatchView = {
    id: sf1Match?.id,
    stage: 'semifinal_1',
    title: 'Semifinal 1',
    seedHomeLabel: '1º Clasificado',
    seedAwayLabel: '3º Clasificado',
    homeTeamName: sf1IsConfirmed
      ? sf1Match?.home_team?.name || '1RO'
      : top1?.teamName || '1º Puesto',
    awayTeamName: sf1IsConfirmed
      ? sf1Match?.away_team?.name || '3ERO'
      : top3?.teamName || '3º Puesto',
    homeTeamId: sf1IsConfirmed ? sf1Match?.home_team_id : top1?.teamId,
    awayTeamId: sf1IsConfirmed ? sf1Match?.away_team_id : top3?.teamId,
    // CRITICAL: Only display scores if the match is confirmed AND finished
    homeScore: sf1IsConfirmed && sf1Match?.status === 'finished' ? sf1Match.home_score : null,
    awayScore: sf1IsConfirmed && sf1Match?.status === 'finished' ? sf1Match.away_score : null,
    status: sf1IsConfirmed ? sf1Match?.status || 'pending' : 'pending',
    matchDate: sf1Match?.match_date,
    streamUrl: sf1Match?.stream_url,
    isConfirmed: sf1IsConfirmed,
    isProjected: !sf1IsConfirmed && Boolean(top1 && top3),
    winnerTeamId: sf1IsConfirmed ? sf1Winner.winnerId : null,
    winnerTeamName: sf1IsConfirmed ? sf1Winner.winnerName : null,
    isTie: sf1IsConfirmed ? sf1Winner.isTie : false,
    match: sf1Match,
  };

  // Semifinal 2 (2º vs 4º)
  const sf2Winner = resolveWinner(sf2Match);
  const sf2IsConfirmed = Boolean(
    sf2Match &&
      !isPlaceholderTeam(sf2Match.home_team?.name) &&
      !isPlaceholderTeam(sf2Match.away_team?.name)
  );

  const semifinal2: PlayoffMatchView = {
    id: sf2Match?.id,
    stage: 'semifinal_2',
    title: 'Semifinal 2',
    seedHomeLabel: '2º Clasificado',
    seedAwayLabel: '4º Clasificado',
    homeTeamName: sf2IsConfirmed
      ? sf2Match?.home_team?.name || '2DO'
      : top2?.teamName || '2º Puesto',
    awayTeamName: sf2IsConfirmed
      ? sf2Match?.away_team?.name || '4TO'
      : top4?.teamName || '4º Puesto',
    homeTeamId: sf2IsConfirmed ? sf2Match?.home_team_id : top2?.teamId,
    awayTeamId: sf2IsConfirmed ? sf2Match?.away_team_id : top4?.teamId,
    homeScore: sf2IsConfirmed && sf2Match?.status === 'finished' ? sf2Match.home_score : null,
    awayScore: sf2IsConfirmed && sf2Match?.status === 'finished' ? sf2Match.away_score : null,
    status: sf2IsConfirmed ? sf2Match?.status || 'pending' : 'pending',
    matchDate: sf2Match?.match_date,
    streamUrl: sf2Match?.stream_url,
    isConfirmed: sf2IsConfirmed,
    isProjected: !sf2IsConfirmed && Boolean(top2 && top4),
    winnerTeamId: sf2IsConfirmed ? sf2Winner.winnerId : null,
    winnerTeamName: sf2IsConfirmed ? sf2Winner.winnerName : null,
    isTie: sf2IsConfirmed ? sf2Winner.isTie : false,
    match: sf2Match,
  };

  // Final Match
  const finalWinner = resolveWinner(finalMatch);
  const finalIsConfirmed = Boolean(
    finalMatch &&
      !isPlaceholderTeam(finalMatch.home_team?.name) &&
      !isPlaceholderTeam(finalMatch.away_team?.name)
  );

  const projectedFinalHomeName =
    semifinal1.winnerTeamName ||
    (semifinal1.isConfirmed
      ? `Ganador ${semifinal1.homeTeamName} vs ${semifinal1.awayTeamName}`
      : 'Ganador SF 1');
  const projectedFinalAwayName =
    semifinal2.winnerTeamName ||
    (semifinal2.isConfirmed
      ? `Ganador ${semifinal2.homeTeamName} vs ${semifinal2.awayTeamName}`
      : 'Ganador SF 2');

  const finalMatchView: PlayoffMatchView = {
    id: finalMatch?.id,
    stage: 'final',
    title: 'Gran Final',
    seedHomeLabel: 'Finalista 1',
    seedAwayLabel: 'Finalista 2',
    homeTeamName: finalIsConfirmed
      ? finalMatch?.home_team?.name || 'Finalista 1'
      : projectedFinalHomeName,
    awayTeamName: finalIsConfirmed
      ? finalMatch?.away_team?.name || 'Finalista 2'
      : projectedFinalAwayName,
    homeTeamId: finalIsConfirmed
      ? finalMatch?.home_team_id
      : semifinal1.winnerTeamId || undefined,
    awayTeamId: finalIsConfirmed
      ? finalMatch?.away_team_id
      : semifinal2.winnerTeamId || undefined,
    homeScore: finalIsConfirmed && finalMatch?.status === 'finished' ? finalMatch.home_score : null,
    awayScore: finalIsConfirmed && finalMatch?.status === 'finished' ? finalMatch.away_score : null,
    status: finalIsConfirmed ? finalMatch?.status || 'pending' : 'pending',
    matchDate: finalMatch?.match_date,
    streamUrl: finalMatch?.stream_url,
    isConfirmed: finalIsConfirmed,
    isProjected: !finalIsConfirmed,
    winnerTeamId: finalIsConfirmed ? finalWinner.winnerId : null,
    winnerTeamName: finalIsConfirmed ? finalWinner.winnerName : null,
    isTie: finalIsConfirmed ? finalWinner.isTie : false,
    match: finalMatch,
  };

  const canGenerateFinal = Boolean(
    semifinal1.winnerTeamId &&
      semifinal2.winnerTeamId &&
      !semifinal1.isTie &&
      !semifinal2.isTie
  );

  const champion =
    finalIsConfirmed && finalWinner.winnerId && finalWinner.winnerName
      ? { teamId: finalWinner.winnerId, teamName: finalWinner.winnerName }
      : null;

  const playoffMatchIds = [sf1Match?.id, sf2Match?.id, finalMatch?.id].filter(
    (id): id is string => Boolean(id)
  );

  return {
    hasEnoughTeams,
    semifinal1,
    semifinal2,
    finalMatch: finalMatchView,
    canGenerateFinal,
    champion,
    playoffMatchIds,
  };
}
