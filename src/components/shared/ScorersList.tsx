import { Trophy } from 'lucide-react';
import { getTeamLogo } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  goals: number;
  team: { name: string };
}

interface ScorersListProps {
  players: Player[];
  variant?: 'full' | 'compact';
}

export function ScorersList({ players, variant = 'full' }: ScorersListProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-col divide-y divide-[#e9c176]/10">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center justify-between py-3 group hover:bg-[#e9c176]/5 transition-all px-2 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="font-anybody font-bold text-[#e9c176]/40 text-xs w-4">{index + 1}</span>
              <div>
                <p className="font-anybody font-bold text-sm uppercase tracking-tight text-white group-hover:text-[#e9c176] transition-colors">{player.name}</p>
                <div className="flex items-center gap-2">
                  <img src={getTeamLogo(player.team.name) || ''} alt="" className="w-3 h-3 object-contain opacity-50" />
                  <p className="text-[9px] font-bold text-[#c5c6cd] uppercase">{player.team.name}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-anybody text-xl font-black text-[#e9c176] italic">{player.goals}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {players.map((player, index) => (
        <div key={player.id} className="glass-panel flex items-center justify-between p-4 rounded-xl border-[#e9c176]/10 hover:bg-[#e9c176]/5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#111415] border border-[#e9c176]/20 flex items-center justify-center font-anybody font-bold text-[#e9c176]">
              {index + 1}
            </div>
            <div>
              <p className="font-anybody font-bold text-lg uppercase tracking-tight">{player.name}</p>
              <div className="flex items-center gap-2">
                <img src={getTeamLogo(player.team.name) || ''} alt="" className="w-4 h-4 object-contain opacity-70" />
                <p className="text-[10px] font-bold text-[#c5c6cd] uppercase">{player.team.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#e9c176]/10 rounded-lg border border-[#e9c176]/20">
            <Trophy className="w-4 h-4 text-[#e9c176]" />
            <span className="font-anybody text-2xl font-black text-[#e9c176] gold-glow">{player.goals}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
