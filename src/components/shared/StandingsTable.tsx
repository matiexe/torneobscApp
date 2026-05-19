import { StandingEntry } from '@/lib/standings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeamLogo } from '@/lib/utils';

interface StandingsTableProps {
  standings: StandingEntry[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden border-[#e9c176]/20">
      <div className="w-full">
        <Table className="w-full border-collapse">
          <TableHeader className="bg-[#e9c176]/10">
            <TableRow className="border-[#e9c176]/10 hover:bg-transparent">
              <TableHead className="w-[30px] text-center font-bold text-[#e9c176] px-0 text-[9px] md:text-xs">#</TableHead>
              <TableHead className="font-bold text-[#e9c176] px-1 text-[9px] md:text-xs">EQUIPO</TableHead>
              <TableHead className="w-[30px] text-center font-bold text-[#e9c176] px-0 text-[9px] md:text-xs">PJ</TableHead>
              <TableHead className="w-[25px] text-center font-bold text-[#e9c176] px-0 text-[9px] md:text-xs">G</TableHead>
              <TableHead className="w-[25px] text-center font-bold text-[#e9c176] px-0 text-[9px] md:text-xs">E</TableHead>
              <TableHead className="w-[25px] text-center font-bold text-[#e9c176] px-0 text-[9px] md:text-xs">P</TableHead>
              <TableHead className="w-[30px] text-center font-bold text-[#e9c176] px-0 text-[9px] md:text-xs">GD</TableHead>
              <TableHead className="w-[40px] text-center font-bold text-[#e9c176] px-1 text-[10px] md:text-xs">PTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((entry, index) => (
              <TableRow key={entry.teamId} className="border-[#e9c176]/5 hover:bg-[#e9c176]/5 transition-colors h-12">
                <TableCell className="text-center font-black italic text-[#e9c176]/60 px-0 text-[10px] md:text-sm">{index + 1}</TableCell>
                <TableCell className="px-1 py-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={getTeamLogo(entry.teamName) || ''} alt="" className="w-4 h-4 md:w-6 md:h-6 object-contain shrink-0" />
                    <span className="font-anybody font-bold text-[10px] md:text-sm uppercase truncate max-w-[80px] md:max-w-none">{entry.teamName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-lexend text-[10px] md:text-xs px-0 font-medium">{entry.played}</TableCell>
                <TableCell className="text-center font-lexend text-[10px] md:text-xs text-[#4ade80] px-0">{entry.won}</TableCell>
                <TableCell className="text-center font-lexend text-[10px] md:text-xs text-[#fbbf24] px-0">{entry.drawn}</TableCell>
                <TableCell className="text-center font-lexend text-[10px] md:text-xs text-[#f87171] px-0">{entry.lost}</TableCell>
                <TableCell className="text-center font-lexend text-[10px] md:text-xs font-bold px-0">{entry.gd > 0 ? `+${entry.gd}` : entry.gd}</TableCell>
                <TableCell className="text-center font-anybody font-black text-[#e9c176] px-1 text-[12px] md:text-base">{entry.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
