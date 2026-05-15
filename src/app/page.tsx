'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateStandings, StandingEntry, Match, Team } from '@/lib/standings';
import { Bell, Calendar, ListOrdered, Swords, Trophy, Users } from 'lucide-react';
import { MatchCard } from '@/components/shared/MatchCard';
import { StandingsTable } from '@/components/shared/StandingsTable';
import { ScorersList } from '@/components/shared/ScorersList';

interface Player {
  id: string;
  name: string;
  goals: number;
  team: { name: string };
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'standings' | 'results' | 'fixture'>('home');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: teamsData } = await supabase.from('teams').select('*');
        const { data: matchesData } = await supabase
          .from('matches')
          .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
          .order('match_date', { ascending: true });
        
        const { data: playersData } = await supabase
          .from('players')
          .select('id, name, goals, team:teams(name)')
          .order('goals', { ascending: false });

        if (teamsData && matchesData) {
          setTeams(teamsData);
          setMatches(matchesData);
          setStandings(calculateStandings(teamsData, matchesData));
        }
        if (playersData) setPlayers(playersData as any);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const nextMatch = matches.find(m => m.status === 'pending');
  const recentResults = matches.filter(m => m.status === 'finished').slice(-2).reverse();
  const upcomingMatches = matches.filter(m => m.status === 'pending').slice(1, 5);

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
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Súper Liga BSC</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#111415] text-[#e1e3e4] font-inter overflow-x-hidden stadium-bg">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-[#111415]/80 backdrop-blur-xl border-b border-[#e9c176]/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#604403]/30 flex items-center justify-center border border-[#e9c176]/40 overflow-hidden p-1">
            <img 
              alt="BSC Logo" 
              className="w-full h-full object-contain" 
              src="/logos/league_logo.png" 
            />
          </div>
          <h1 className="font-anybody text-xl font-bold tracking-wider uppercase text-[#e9c176]">SÚPER LIGA BSC</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-[#e9c176] active:scale-95 duration-200">
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <div className="pt-24 pb-32 px-4 max-w-6xl mx-auto">
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-700">
            {/* Live Stream Section (Dynamic) */}
            {nextMatch?.stream_url && (
              <section className="mb-8">
                <div className="glass-panel rounded-xl overflow-hidden border-[#e9c176]/30 bg-black/40 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                    <h3 className="font-anybody text-sm font-bold text-white uppercase tracking-widest">Transmisión en Vivo</h3>
                  </div>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-[#0a192f] border border-white/10">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${nextMatch.stream_url.split('v=')[1] || nextMatch.stream_url.split('/').pop()}`}
                      title="Live Stream" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      className="absolute inset-0"
                    ></iframe>
                  </div>
                </div>
              </section>
            )}

            {/* Hero Section: Featured Next Match */}
            <section className="mb-12">
              <div className="relative overflow-hidden rounded-xl border border-[#e9c176]/30 bg-[#0a192f] shadow-2xl p-6 md:p-10">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <img alt="Estadio" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD90YWGTIuE4pXrMvpgTC5Ec916IlJgzD__bgevi2Livcu29Y18xN8x0QkITBNHs8EB9HcsZ3_RJ19HQRR8TvS3ISdpvn2oGoMVfriILRHO4Bpl8cOV1RaBMtK9wlsze1bfyr1dJYxe5yHkOavF79WDJ7ouuqJMwoW7F7VokqSbc5GHGDcvZ9bl42IfpWhMG7A_qdf46OPWWhXMoDAipoBBZv2er_Okpzjjmuc64QON9iJL3DVdqRbuDfyflVDOgfwY8nvIpcoPxN4" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-6 px-4 py-1 rounded-full bg-[#e9c176]/10 border border-[#e9c176]/20">
                    <span className="w-2 h-2 rounded-full bg-[#e9c176] animate-pulse"></span>
                    <span className="font-lexend text-[10px] font-bold text-[#e9c176] uppercase tracking-widest">Próximo Partido</span>
                  </div>
                  
                  {nextMatch ? (
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-8 mb-4">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full glass-panel flex items-center justify-center p-4 border-[#e9c176]/40 overflow-hidden">
                          <img src={getTeamLogo(nextMatch.home_team?.name) || ''} alt={nextMatch.home_team?.name} className="w-20 h-20 object-contain scale-125" />
                        </div>
                        <h2 className="font-anybody text-xl font-semibold text-center uppercase">{nextMatch.home_team?.name}</h2>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center py-4 border-y md:border-y-0 md:border-x border-[#e9c176]/20">
                        <span className="font-anybody text-5xl font-extrabold text-[#e9c176] gold-glow mb-2 italic">VS</span>
                        <div className="text-center">
                          <p className="font-anybody text-xl font-semibold text-[#e9c176]">21:00 HRS</p>
                          <p className="text-xs text-[#c5c6cd]">{new Date(nextMatch.match_date).toLocaleDateString()} • La Curtiembre</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full glass-panel flex items-center justify-center p-4 border-[#e9c176]/40 overflow-hidden">
                          <img src={getTeamLogo(nextMatch.away_team?.name) || ''} alt={nextMatch.away_team?.name} className="w-20 h-20 object-contain scale-125" />
                        </div>
                        <h2 className="font-anybody text-xl font-semibold text-center uppercase">{nextMatch.away_team?.name}</h2>
                      </div>
                    </div>
                  ) : <p className="py-10">No hay partidos próximos</p>}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Results Column */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="metallic-border-bottom pb-2 mb-2">
                  <h3 className="font-anybody text-lg font-semibold text-[#e9c176] flex items-center gap-2">
                    <Swords className="w-5 h-5" /> Resultados
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {recentResults.map(result => (
                    <MatchCard key={result.id} match={result} type="result" />
                  ))}
                </div>
              </div>

              {/* Fixture Column */}
              <div className="lg:col-span-2">
                <div className="metallic-border-bottom pb-2 mb-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-anybody text-lg font-semibold text-[#e9c176] flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> Próximas Jornadas
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {upcomingMatches.map(match => (
                    <MatchCard key={match.id} match={match} type="fixture" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="animate-in slide-in-from-right duration-500">
             <section className="mb-10 text-center md:text-left">
               <div className="inline-block px-4 py-1 rounded-full bg-[#e9c176]/10 border border-[#e9c176]/20 mb-4">
                 <span className="font-lexend text-[10px] font-bold text-[#e9c176] uppercase tracking-widest">Temporada 2026</span>
               </div>
               <h2 className="font-anybody text-4xl font-extrabold text-white mb-2 uppercase italic tracking-tighter">TABLA DE POSICIONES</h2>
               <p className="text-[#c5c6cd] font-inter text-lg max-w-2xl">El camino a la gloria eterna. Sigue el desempeño de los mejores equipos de la región en la máxima competición.</p>
             </section>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <StandingsTable standings={standings} />
                </div>

                <div className="lg:col-span-4 space-y-6">
                  {/* Top 5 Scorers Card */}
                  <div className="glass-panel rounded-xl overflow-hidden p-6 border-[#e9c176]/20">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-anybody text-lg font-bold text-[#e9c176] uppercase italic">Goleadores</h4>
                      <Trophy className="w-5 h-5 text-[#e9c176] opacity-50" />
                    </div>
                    <ScorersList players={players.slice(0, 5)} variant="compact" />
                  </div>

                  {/* Quick Info Box */}
                  <div className="glass-panel rounded-xl p-6 border-[#e9c176]/10">
                    <h4 className="font-lexend font-bold text-white uppercase tracking-widest text-[10px] mb-4">Análisis de la Liga</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#c5c6cd]">Partidos Jugados</span>
                        <span className="font-bold text-white">{matches.filter(m => m.status === 'finished').length}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#c5c6cd]">Promedio de Goles</span>
                        <span className="font-bold text-white">
                          {matches.filter(m => m.status === 'finished').length > 0 
                            ? (matches.filter(m => m.status === 'finished').reduce((acc, m) => acc + (m.home_score || 0) + (m.away_score || 0), 0) / matches.filter(m => m.status === 'finished').length).toFixed(1)
                            : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="animate-in slide-in-from-bottom duration-500 max-w-4xl mx-auto">
             <div className="mb-8 relative overflow-hidden rounded-xl metallic-border p-8 text-center bg-[#191c1d] border-b-2 border-[#e9c176]">
               <h2 className="font-anybody text-4xl font-black gold-gradient-text uppercase mb-2">Resultados Finales</h2>
               <p className="font-anybody text-[#c5c6cd] tracking-[0.2em] uppercase text-xs">Temporada 2026</p>
             </div>
             <div className="grid gap-4">
                {matches.filter(m => m.status === 'finished').length > 0 ? (
                  matches.filter(m => m.status === 'finished')
                    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
                    .map(match => (
                      <MatchCard key={match.id} match={match} type="result" />
                    ))
                ) : (
                  <div className="text-center py-20 glass-panel rounded-xl border-dashed border-[#e9c176]/20">
                    <Swords className="w-12 h-12 text-[#e9c176]/20 mx-auto mb-4" />
                    <p className="text-[#c5c6cd] font-anybody uppercase tracking-widest text-sm">No hay resultados registrados aún</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'fixture' && (
          <div className="animate-in fade-in duration-500">
             {/* Seasonal Header */}
             <div className="relative w-full mb-8 overflow-hidden rounded-xl h-48 md:h-64 flex flex-col justify-end p-6 glass-panel border-none shadow-2xl">
               <div className="absolute inset-0 z-0">
                 <img 
                   className="w-full h-full object-cover opacity-40" 
                   src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSGw7VbcTP-z4WCTtBt4-zpG-YMF_yMOguhmsu-a-kXhKrU9KFwT893vl80fAokeu0OPgt8xhHIWSG8NCFp10InUrxsM4vQFSpxm20zZXYhiOkq6hFezdBsdP6uNl-UsVUIdbwMMLNVEC9uGGl2DyAKVZxogqlr5kC97E5NJiGNPGk70tNmK6YCzBFXV03rVgv5uxmRnOwXSoYNHTmK5TobR0560ptc7HI84rrnbbUY97J7kaAgaKb5DX-PpWVlhpt48loiL6ores" 
                   alt="Stadium" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#111415] via-transparent to-transparent"></div>
               </div>
               <div className="relative z-10">
                 <p className="font-lexend text-[10px] font-bold text-[#e9c176] uppercase tracking-[0.3em] mb-1">Campeonato Oficial</p>
                 <h2 className="font-anybody text-2xl md:text-5xl font-black text-[#e9c176] italic">TEMPORADA 2026</h2>
                 <div className="h-1 w-32 bg-[#e9c176] mt-2 shadow-[0_0_10px_#e9c176]"></div>
               </div>
             </div>

             <div className="flex items-center justify-between metallic-border-bottom pb-2 mb-6">
               <h3 className="font-anybody text-xl font-bold text-[#e9c176] uppercase tracking-wider">Calendario de Partidos</h3>
               <span className="font-lexend text-[10px] text-[#c5c6cd] uppercase font-bold">Próximos Encuentros</span>
             </div>

             <div className="grid gap-4">
                {matches.map(match => (
                  <MatchCard key={match.id} match={match} type="fixture" />
                ))}
             </div>
          </div>
        )}
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-[#1d2021]/90 backdrop-blur-xl rounded-t-xl border-t border-[#e9c176]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {[
          { id: 'home', label: 'Inicio', icon: Trophy },
          { id: 'standings', label: 'Tabla', icon: ListOrdered },
          { id: 'results', label: 'Resultados', icon: Swords },
          { id: 'fixture', label: 'Fixture', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all duration-300 active:scale-90 ${
              activeTab === tab.id ? 'text-[#e9c176] bg-[#604403]/20 scale-105 shadow-inner' : 'text-[#c5c6cd] opacity-50 hover:opacity-100'
            }`}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="font-lexend text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
