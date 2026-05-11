'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Match, Team } from '@/lib/standings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Trophy, Image as ImageIcon, Users, Plus } from 'lucide-react';

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

    if (!error) { alert('Marcador guardado'); fetchData(); }
  }

  async function updatePlayerGoals(playerId: string, goals: number) {
    const { error } = await supabase
      .from('players')
      .update({ goals: goals })
      .eq('id', playerId);

    if (!error) { alert('Goles actualizados'); fetchData(); }
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
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#e9c176]" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-24 px-4 space-y-10">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-xl metallic-border p-8 text-center bg-[#191c1d]/50 backdrop-blur-md border-b-2 border-[#e9c176]">
          <h2 className="font-anybody text-4xl font-black gold-gradient-text uppercase mb-2 italic">Panel de Control</h2>
          <p className="font-lexend text-[10px] font-bold text-[#c5c6cd] uppercase tracking-[0.4em]">Gestión Centralizada del Torneo</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Matches */}
          <section className="space-y-6">
            <div className="flex items-center justify-between metallic-border-bottom pb-2">
              <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                <Trophy className="w-5 h-5" /> Marcadores
              </h3>
              <Badge variant="outline" className="border-[#e9c176]/30 text-[#e9c176] text-[9px] uppercase">{matches.filter(m => m.status === 'pending').length} Pendientes</Badge>
            </div>
            
            <div className="grid gap-4">
              {matches.filter(m => m.status === 'pending').map(match => (
                <MatchScoreForm key={match.id} match={match} onSave={updateScore} />
              ))}
              {matches.filter(m => m.status === 'pending').length === 0 && (
                <div className="glass-panel p-8 rounded-xl text-center text-[#c5c6cd] italic text-sm">
                  Todos los partidos están finalizados
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Actions & Players */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <section className="space-y-4">
              <div className="metallic-border-bottom pb-2">
                <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                  <ImageIcon className="w-5 h-5" /> Herramientas
                </h3>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-[#e9c176] to-[#ffdea5] hover:scale-[1.02] transition-transform text-[#412d00] font-anybody font-black uppercase italic tracking-tighter h-14 rounded-xl shadow-xl shadow-[#e9c176]/10" 
                onClick={() => window.open('/api/og', '_blank')}
              >
                Generar Banner de Redes
              </Button>
            </section>

            {/* Scorers Management */}
            <section className="space-y-4">
              <div className="metallic-border-bottom pb-2">
                <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                  <Users className="w-5 h-5" /> Goleadores
                </h3>
              </div>
              <div className="glass-panel rounded-xl overflow-hidden divide-y divide-[#44474d]/20">
                {players.map(player => (
                  <div key={player.id} className="flex items-center justify-between gap-4 p-4 hover:bg-[#e9c176]/5 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg border border-[#44474d]/30 bg-white/5 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={getTeamLogo(player.team?.name) || ''} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-anybody font-bold text-white uppercase italic text-sm truncate">{player.name}</p>
                        <p className="font-lexend text-[9px] font-bold text-[#c5c6cd] uppercase tracking-wider truncate">{player.team?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="number" 
                        className="w-16 h-10 bg-[#0c0f10] border-[#e9c176]/20 text-[#e9c176] text-center font-anybody font-black text-lg rounded-lg focus:ring-[#e9c176]/40"
                        defaultValue={player.goals}
                        onBlur={(e) => updatePlayerGoals(player.id, parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
                <button className="w-full p-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-[#e9c176]/50 hover:text-[#e9c176] hover:bg-[#e9c176]/5 transition-all">
                  <Plus className="w-4 h-4" /> Añadir Jugador
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function MatchScoreForm({ match, onSave }: { match: Match, onSave: (id: string, h: number, a: number) => void }) {
  const [h, setH] = useState('');
  const [a, setA] = useState('');
  return (
    <div className="glass-panel rounded-xl p-5 border-l-4 border-l-[#e9c176] hover:bg-[#e9c176]/5 transition-all">
      <div className="flex justify-between items-center mb-6">
        <span className="font-lexend text-[10px] font-bold text-[#e9c176] uppercase tracking-[0.2em]">{new Date(match.match_date).toLocaleDateString()}</span>
        <Badge className="bg-[#e9c176]/10 text-[#e9c176] border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 animate-pulse">Pendiente</Badge>
      </div>
      
      <div className="grid grid-cols-7 items-center gap-2 mb-6">
        <div className="col-span-3 text-center">
          <p className="font-anybody text-[10px] font-black uppercase text-[#c5c6cd] mb-3 truncate">{match.home_team?.name}</p>
          <Input 
            className="bg-[#0c0f10] border-[#e9c176]/20 h-12 text-center font-anybody font-black text-2xl text-white rounded-xl focus:border-[#e9c176]" 
            value={h} 
            onChange={e => setH(e.target.value)} 
            placeholder="0"
          />
        </div>
        <div className="col-span-1 flex flex-col items-center">
          <span className="font-anybody font-black text-[#e9c176] italic text-xl mt-6">VS</span>
        </div>
        <div className="col-span-3 text-center">
          <p className="font-anybody text-[10px] font-black uppercase text-[#c5c6cd] mb-3 truncate">{match.away_team?.name}</p>
          <Input 
            className="bg-[#0c0f10] border-[#e9c176]/20 h-12 text-center font-anybody font-black text-2xl text-white rounded-xl focus:border-[#e9c176]" 
            value={a} 
            onChange={e => setA(e.target.value)} 
            placeholder="0"
          />
        </div>
      </div>
      
      <Button 
        className="w-full bg-white/5 hover:bg-[#e9c176] hover:text-[#412d00] text-white font-anybody font-black uppercase italic text-xs h-11 rounded-lg transition-all border border-[#e9c176]/20"
        onClick={() => onSave(match.id, parseInt(h), parseInt(a))}
        disabled={!h || !a}
      >
        Finalizar y Guardar
      </Button>
    </div>
  );
}
