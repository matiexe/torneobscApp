import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

// Cambiamos a nodejs para evitar errores de evaluación de Edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: matches } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)')
      .eq('status', 'pending')
      .order('match_date', { ascending: true })
      .limit(3);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020617',
            padding: '60px',
          }}
        >
          <h1 style={{ fontSize: 60, color: 'white', fontWeight: 'bold' }}>PRÓXIMAS FECHAS</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {matches?.map((match: any) => (
              <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontSize: 30, background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px' }}>
                <span>{match.home_team.name}</span>
                <span style={{ color: '#eab308' }}>VS</span>
                <span>{match.away_team.name}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
