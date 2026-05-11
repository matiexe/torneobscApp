import { Match } from '@/lib/standings';
import { Swords } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  type: 'result' | 'fixture';
}

export function MatchCard({ match, type }: MatchCardProps) {
  const getTeamLogo = (teamName: string | undefined) => {
    if (!teamName) return null;
    const slug = teamName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ñ/g, 'n');
    return `/logos/${slug}.png`;
  };

  if (type === 'result') {
    return (
      <div className="match-card-gradient border border-[#44474d]/30 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-[10px] text-[#c5c6cd] font-bold uppercase border-b border-[#44474d]/20 pb-2">
          <span>Finalizado</span>
          <span className="text-[#ffb4ab]">Live Score</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1 overflow-hidden">
            <img src={getTeamLogo(match.home_team?.name) || ''} alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-[10px] font-bold uppercase truncate w-full text-center">{match.home_team?.name}</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-1 bg-[#1d2021] rounded-lg border border-[#e9c176]/10">
            <span className="font-anybody text-xl font-bold">{match.home_score}</span>
            <span className="text-[#e9c176]/40">-</span>
            <span className="font-anybody text-xl font-bold">{match.away_score}</span>
          </div>
          <div className="flex flex-col items-center flex-1 overflow-hidden">
            <img src={getTeamLogo(match.away_team?.name) || ''} alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-[10px] font-bold uppercase truncate w-full text-center">{match.away_team?.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between glass-panel rounded-lg p-3 md:px-6 hover:bg-[#e9c176]/5 transition-colors border-[#e9c176]/10">
      <div className="w-24 flex flex-col">
        <span className="font-lexend text-[11px] font-bold">{new Date(match.match_date).toLocaleDateString()}</span>
      </div>
      <div className="flex-1 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-[10px] font-bold uppercase truncate text-right">{match.home_team?.name}</span>
          <img src={getTeamLogo(match.home_team?.name) || ''} alt="" className="w-5 h-5 object-contain" />
        </div>
        <div className="px-3 py-1 bg-[#0a192f] rounded border border-[#e9c176]/20 font-anybody text-[#e9c176] text-xs font-bold">VS</div>
        <div className="flex items-center gap-2 flex-1 justify-start">
          <img src={getTeamLogo(match.away_team?.name) || ''} alt="" className="w-5 h-5 object-contain" />
          <span className="text-[10px] font-bold uppercase truncate text-left">{match.away_team?.name}</span>
        </div>
      </div>
      <div className="w-20 text-right">
        <span className="font-lexend text-[10px] font-bold text-[#e9c176]">21:00 HRS</span>
      </div>
    </div>
  );
}
