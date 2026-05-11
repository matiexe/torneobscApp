'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Match, Team } from '@/lib/standings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Trophy, Image as ImageIcon, Users, Plus, LogOut, LayoutDashboard } from 'lucide-react';
import { MatchScoreForm } from '@/components/shared/MatchScoreForm';
import { useRouter } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  goals: number;
  team_id: string;
  team?: { name: string };
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: mData } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .order('match_date', { ascending: true });
    
    const { data: pData } = await supabase
      .from('players')
      .select('*, team:teams(name)')
      .order('goals', { ascending: false });

    const { data: tData } = await supabase.from('teams').select('*');

    if (mData) setMatches(mData);
    if (pData) setPlayers(pData as any);
    if (tData) setTeams(tData);
    setLoading(false);
  }

  async function updateScore(matchId: string, homeScore: number, awayScore: number) {
    const { error } = await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore, status: 'finished' })
      .eq('id', matchId);

    if (error) throw error;
    fetchData();
  }

  async function updatePlayerGoals(playerId: string, goals: number) {
    const { error } = await supabase
      .from('players')
      .update({ goals: goals })
      .eq('id', playerId);

    if (error) console.error(error);
    fetchData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const getTeamLogo = (teamName: string | undefined) => {
    if (!teamName) return null;
    const slug = teamName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ñ/g, 'n');
    return `/logos/${slug}.png`;
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#111415] text-[#e9c176]">
      <div className="w-12 h-12 border-2 border-[#e9c176]/20 border-t-[#e9c176] rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Cargando Elite Admin...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] pb-20 stadium-bg font-inter">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#111415]/80 backdrop-blur-xl border-b border-[#e9c176]/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#604403]/30 flex items-center justify-center border border-[#e9c176]/40 overflow-hidden p-1">
            <img 
              alt="BSC Logo" 
              className="w-full h-full object-contain" 
              src="/logos/league_logo.png" 
            />
          </div>
          <h1 className="font-anybody text-xl font-bold tracking-wider uppercase text-[#e9c176]">ELITE ADMIN</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="text-[#c5c6cd] hover:text-[#e9c176] transition-colors flex items-center gap-2 text-xs font-bold uppercase"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Ver Sitio</span>
          </button>
          <button 
            onClick={handleLogout}
            className="text-[#ffb4ab] hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-24 px-4">
        {/* Welcome Section */}
        <section className="mb-10 relative overflow-hidden rounded-xl metallic-border p-8 text-center bg-[#191c1d]/50 backdrop-blur-md border-b-2 border-[#e9c176]">
          <h2 className="font-anybody text-4xl font-black gold-gradient-text uppercase mb-2 italic">Panel de Control</h2>
          <p className="font-lexend text-[10px] font-bold text-[#c5c6cd] uppercase tracking-[0.4em]">Gestión Centralizada del Torneo</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Match Management */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between metallic-border-bottom pb-2">
              <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                <Trophy className="w-5 h-5" /> Gestión de Partidos
              </h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-[#e9c176]/30 text-[#e9c176] text-[9px] uppercase">
                  {matches.filter(m => m.status === 'pending').length} Pendientes
                </Badge>
                <Badge variant="outline" className="border-[#4ade80]/30 text-[#4ade80] text-[9px] uppercase">
                  {matches.filter(m => m.status === 'finished').length} Finalizados
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.filter(m => m.status === 'pending').map(match => (
                <MatchScoreForm key={match.id} match={match} onSave={updateScore} />
              ))}
            </div>

            {matches.filter(m => m.status === 'finished').length > 0 && (
              <>
                <h4 className="font-anybody text-sm font-bold text-[#c5c6cd] uppercase tracking-widest pt-4">Resultados Recientes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.filter(m => m.status === 'finished').slice(-4).map(match => (
                    <MatchScoreForm key={match.id} match={match} onSave={updateScore} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: Players & Tools */}
          <div className="lg:col-span-5 space-y-8">
            {/* Quick Tools */}
            <section className="space-y-4">
              <div className="metallic-border-bottom pb-2">
                <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                  <Settings className="w-5 h-5" /> Herramientas Rápidas
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  className="bg-white/5 hover:bg-[#e9c176] hover:text-black border border-[#e9c176]/20 h-14 justify-start px-6 gap-4"
                  onClick={() => window.open('/api/og', '_blank')}
                >
                  <ImageIcon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-anybody font-black uppercase italic text-sm tracking-tighter">Generar Banner Social</p>
                    <p className="text-[9px] font-bold uppercase opacity-60">Crea imagen para redes</p>
                  </div>
                </Button>
              </div>
            </section>

            {/* Players Table */}
            <section className="space-y-4">
              <div className="metallic-border-bottom pb-2 flex justify-between items-center">
                <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                  <Users className="w-5 h-5" /> Tabla de Goleadores
                </h3>
                <button className="p-2 bg-[#e9c176]/10 rounded-lg text-[#e9c176] hover:bg-[#e9c176]/20 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="glass-panel rounded-xl overflow-hidden divide-y divide-[#44474d]/20">
                {players.map(player => (
                  <div key={player.id} className="flex items-center justify-between gap-4 p-4 hover:bg-[#e9c176]/5 transition-colors">
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg border border-[#44474d]/30 bg-white/5 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={getTeamLogo(player.team?.name) || ''} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-anybody font-bold text-white uppercase italic text-sm truncate">{player.name}</p>
                        <p className="font-lexend text-[9px] font-bold text-[#c5c6cd] uppercase tracking-wider truncate">{player.team?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        className="w-14 h-10 bg-[#0c0f10] border border-[#e9c176]/20 text-[#e9c176] text-center font-anybody font-black text-lg rounded-lg focus:outline-none focus:border-[#e9c176] transition-colors"
                        defaultValue={player.goals}
                        onBlur={(e) => updatePlayerGoals(player.id, parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
