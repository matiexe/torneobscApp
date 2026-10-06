import { Match, StandingEntry, Team } from './standings';

export const PLAYOFF_PLACEHOLDERS = [
  '1RO',
  '4TO',
  '2DO',
  '3ERO',
  'FINALISTA 1',
  'FINALISTA 2',
] as const;

export function isPlaceholderTeam(name?: string | null): boolean {
  if (!name) return true;
  const upper = name.trim().toUpperCase();
  return (PLAYOFF_PLACEHOLDERS as readonly string[]).includes(upper);
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
}

/**
 * Searches for existing playoff matches in the database matches list.
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

  // Helper to match team names (case-insensitive)
  const hasTeams = (m: Match, nameA: string, nameB: string) => {
    const h = m.home_team?.name?.toUpperCase().trim();
    const a = m.away_team?.name?.toUpperCase().trim();
    const targetA = nameA.toUpperCase().trim();
    const targetB = nameB.toUpperCase().trim();
    return (h === targetA && a === targetB) || (h === targetB && a === targetA);
  };

  const hasTeamIds = (m: Match, idA?: string, idB?: string) => {
    if (!idA || !idB) return false;
    return (
      (m.home_team_id === idA && m.away_team_id === idB) ||
      (m.home_team_id === idB && m.away_team_id === idA)
    );
  };

  // 1. Detect Semifinal 1 (1RO vs 3ERO, or legacy placeholder)
  let sf1Match = matches.find((m) => hasTeams(m, '1RO', '3ERO') || hasTeams(m, '1RO', '4TO'));
  if (!sf1Match && top1 && top3) {
    // If already generated with actual teams, find match between top 1 and top 3
    sf1Match = matches.find((m) => hasTeamIds(m, top1.teamId, top3.teamId));
  }
  if (!sf1Match && top1 && top4) {
    sf1Match = matches.find((m) => hasTeamIds(m, top1.teamId, top4.teamId));
  }

  // 2. Detect Semifinal 2 (2DO vs 4TO, or legacy placeholder)
  let sf2Match = matches.find((m) => hasTeams(m, '2DO', '4TO') || hasTeams(m, '2DO', '3ERO'));
  if (!sf2Match && top2 && top4) {
    sf2Match = matches.find((m) => hasTeamIds(m, top2.teamId, top4.teamId));
  }
  if (!sf2Match && top2 && top3) {
    sf2Match = matches.find((m) => hasTeamIds(m, top2.teamId, top3.teamId));
  }

  // 3. Detect Final (FINALISTA 1 vs FINALISTA 2)
  let finalMatch = matches.find((m) => hasTeams(m, 'FINALISTA 1', 'FINALISTA 2'));
  if (!finalMatch) {
    // Or match with any FINALISTA placeholder
    finalMatch = matches.find(
      (m) =>
        m.home_team?.name?.toUpperCase().includes('FINALISTA') ||
        m.away_team?.name?.toUpperCase().includes('FINALISTA')
    );
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
    homeScore: sf1Match?.home_score ?? null,
    awayScore: sf1Match?.away_score ?? null,
    status: sf1Match?.status || 'pending',
    matchDate: sf1Match?.match_date,
    streamUrl: sf1Match?.stream_url,
    isConfirmed: sf1IsConfirmed,
    isProjected: !sf1IsConfirmed && Boolean(top1 && top3),
    winnerTeamId: sf1Winner.winnerId,
    winnerTeamName: sf1Winner.winnerName,
    isTie: sf1Winner.isTie,
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
    homeScore: sf2Match?.home_score ?? null,
    awayScore: sf2Match?.away_score ?? null,
    status: sf2Match?.status || 'pending',
    matchDate: sf2Match?.match_date,
    streamUrl: sf2Match?.stream_url,
    isConfirmed: sf2IsConfirmed,
    isProjected: !sf2IsConfirmed && Boolean(top2 && top4),
    winnerTeamId: sf2Winner.winnerId,
    winnerTeamName: sf2Winner.winnerName,
    isTie: sf2Winner.isTie,
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
    sf1Winner.winnerName ||
    (semifinal1.isConfirmed ? `Ganador ${semifinal1.homeTeamName} vs ${semifinal1.awayTeamName}` : 'Ganador SF 1');
  const projectedFinalAwayName =
    sf2Winner.winnerName ||
    (semifinal2.isConfirmed ? `Ganador ${semifinal2.homeTeamName} vs ${semifinal2.awayTeamName}` : 'Ganador SF 2');

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
    homeTeamId: finalIsConfirmed ? finalMatch?.home_team_id : sf1Winner.winnerId || undefined,
    awayTeamId: finalIsConfirmed ? finalMatch?.away_team_id : sf2Winner.winnerId || undefined,
    homeScore: finalMatch?.home_score ?? null,
    awayScore: finalMatch?.away_score ?? null,
    status: finalMatch?.status || 'pending',
    matchDate: finalMatch?.match_date,
    streamUrl: finalMatch?.stream_url,
    isConfirmed: finalIsConfirmed,
    isProjected: !finalIsConfirmed,
    winnerTeamId: finalWinner.winnerId,
    winnerTeamName: finalWinner.winnerName,
    isTie: finalWinner.isTie,
    match: finalMatch,
  };

  const canGenerateFinal = Boolean(
    sf1Winner.winnerId && sf2Winner.winnerId && !sf1Winner.isTie && !sf2Winner.isTie
  );

  const champion =
    finalWinner.winnerId && finalWinner.winnerName
      ? { teamId: finalWinner.winnerId, teamName: finalWinner.winnerName }
      : null;

  return {
    hasEnoughTeams,
    semifinal1,
    semifinal2,
    finalMatch: finalMatchView,
    canGenerateFinal,
    champion,
  };
}
