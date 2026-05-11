import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)');

    if (matchId) {
      query = query.eq('id', matchId);
    } else {
      query = query.eq('status', 'pending').order('match_date', { ascending: true }).limit(1);
    }

    const { data: matches } = await query;
    const match = matches?.[0];

    if (!match) {
      return new Response('No se encontró el partido', { status: 404 });
    }

    const getTeamLogoUrl = (team: any) => {
      if (team.logo_url && team.logo_url.startsWith('http')) return team.logo_url;
      const slug = team.name.toLowerCase().replace(/\s+/g, '_').replace(/ñ/g, 'n');
      // En el entorno de OG, necesitamos URLs absolutas. 
      // Usaremos un fallback de imagen si no podemos determinar la URL base.
      return `https://torneobsc.vercel.app/logos/${slug}.png`;
    };

    const date = new Date(match.match_date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

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
            backgroundColor: '#111415',
            backgroundImage: 'radial-gradient(circle at center, #1d2021 0%, #111415 100%)',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
             <div style={{ display: 'flex', background: '#60440333', padding: '10px', borderRadius: '50%', border: '1px solid #e9c17666' }}>
                <img src="https://torneobsc.vercel.app/logos/league_logo.png" width="60" height="60" style={{ objectFit: 'contain' }} />
             </div>
             <h1 style={{ fontSize: 40, color: '#e9c176', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>SÚPER LIGA BSC</h1>
          </div>

          {/* VS Section */}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '50px' }}>
            {/* Home Team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', width: '220px', height: '220px', background: 'rgba(233,193,118,0.05)', borderRadius: '50%', border: '2px solid #e9c17644', alignItems: 'center', justifyContent: 'center', padding: '20px', marginBottom: '20px' }}>
                <img src={getTeamLogoUrl(match.home_team)} width="160" height="160" style={{ objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: 36, color: 'white', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' }}>{match.home_team.name}</h2>
            </div>

            {/* VS Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 100, fontWeight: '900', color: '#e9c176', fontStyle: 'italic', opacity: 0.8 }}>VS</div>
              <div style={{ background: '#e9c176', color: '#111415', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold', fontSize: 20 }}>21:00 HRS</div>
            </div>

            {/* Away Team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', width: '220px', height: '220px', background: 'rgba(233,193,118,0.05)', borderRadius: '50%', border: '2px solid #e9c17644', alignItems: 'center', justifyContent: 'center', padding: '20px', marginBottom: '20px' }}>
                <img src={getTeamLogoUrl(match.away_team)} width="160" height="160" style={{ objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: 36, color: 'white', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' }}>{match.away_team.name}</h2>
            </div>
          </div>

          {/* Footer Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            <div style={{ height: '2px', width: '300px', background: 'linear-gradient(to right, transparent, #e9c176, transparent)', marginBottom: '15px' }}></div>
            <p style={{ fontSize: 24, color: '#c5c6cd', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '4px' }}>{date}</p>
            <p style={{ fontSize: 18, color: '#e9c176', fontWeight: 'bold', marginTop: '5px' }}>ESTADIO MONUMENTAL • GUAYAQUIL</p>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
