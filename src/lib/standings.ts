export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: 'pending' | 'finished';
  home_team?: Team;
  away_team?: Team;
}

export interface StandingEntry {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export function calculateStandings(teams: Team[], matches: Match[]): StandingEntry[] {
  const standingsMap: Record<string, StandingEntry> = {};

  teams.forEach((team) => {
    standingsMap[team.id] = {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
    };
  });

  matches.forEach((match) => {
    if (match.status !== 'finished' || match.home_score === null || match.away_score === null) return;

    const home = standingsMap[match.home_team_id];
    const away = standingsMap[match.away_team_id];

    if (!home || !away) return;

    home.played++;
    away.played++;
    home.gf += match.home_score;
    home.ga += match.away_score;
    away.gf += match.away_score;
    away.ga += match.home_score;

    if (match.home_score > match.away_score) {
      home.won++;
      home.pts += 3;
      away.lost++;
    } else if (match.home_score < match.away_score) {
      away.won++;
      away.pts += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.pts += 1;
      away.pts += 1;
    }
  });

  return Object.values(standingsMap)
    .map((entry) => ({
      ...entry,
      gd: entry.gf - entry.ga,
    }))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
}
