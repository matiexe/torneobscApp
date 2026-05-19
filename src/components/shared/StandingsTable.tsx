import { StandingEntry } from '@/lib/standings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeamLogo } from '@/lib/utils';

interface StandingsTableProps {
  standings: StandingEntry[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden border-[#e9c176]/20">
      <div className="overflow-x-auto no-scrollbar">
        <Table className="min-w-[450px] md:min-w-full">
          <TableHeader className="bg-[#e9c176]/10">
            <TableRow className="border-[#e9c176]/10 hover:bg-transparent">
              <TableHead className="w-10 text-center font-bold text-[#e9c176] px-2">#</TableHead>
              <TableHead className="font-bold text-[#e9c176] px-2">EQUIPO</TableHead>
              <TableHead className="text-center font-bold text-[#e9c176] px-1">PJ</TableHead>
              <TableHead className="text-center font-bold text-[#e9c176] px-1">G</TableHead>
              <TableHead className="text-center font-bold text-[#e9c176] px-1">E</TableHead>
              <TableHead className="text-center font-bold text-[#e9c176] px-1">P</TableHead>
              <TableHead className="text-center font-bold text-[#e9c176] px-1">GD</TableHead>
              <TableHead className="text-center font-bold text-[#e9c176] px-2">PTS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((entry, index) => (
              <TableRow key={entry.teamId} className="border-[#e9c176]/5 hover:bg-[#e9c176]/5 transition-colors">
                <TableCell className="text-center font-black italic text-[#e9c176]/60 px-2">{index + 1}</TableCell>
                <TableCell className="px-2">
                  <div className="flex items-center gap-2">
                    <img src={getTeamLogo(entry.teamName) || ''} alt="" className="w-5 h-5 object-contain" />
                    <span className="font-anybody font-bold text-xs md:text-sm uppercase truncate max-w-[100px] md:max-w-none">{entry.teamName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-lexend text-xs px-1">{entry.played}</TableCell>
                <TableCell className="text-center font-lexend text-xs text-[#4ade80] px-1">{entry.won}</TableCell>
                <TableCell className="text-center font-lexend text-xs text-[#fbbf24] px-1">{entry.drawn}</TableCell>
                <TableCell className="text-center font-lexend text-xs text-[#f87171] px-1">{entry.lost}</TableCell>
                <TableCell className="text-center font-lexend text-xs font-bold px-1">{entry.gd > 0 ? `+${entry.gd}` : entry.gd}</TableCell>
                <TableCell className="text-center font-anybody font-black text-[#e9c176] px-2">{entry.pts}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
