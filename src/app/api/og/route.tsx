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

    // Detectar la URL base de forma más robusta
    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const stadiumBg = "https://lh3.googleusercontent.com/aida-public/AB6AXuD90YWGTIuE4pXrMvpgTC5Ec916IlJgzD__bgevi2Livcu29Y18xN8x0QkITBNHs8EB9HcsZ3_RJ19HQRR8TvS3ISdpvn2oGoMVfriILRHO4Bpl8cOV1RaBMtK9wlsze1bfyr1dJYxe5yHkOavF79WDJ7ouuqJMwoW7F7VokqSbc5GHGDcvZ9bl42IfpWhMG7A_qdf46OPWWhXMoDAipoBBZv2er_Okpzjjmuc64QON9iJL3DVdqRbuDfyflVDOgfwY8nvIpcoPxN4";

    const getTeamLogoUrl = (team: any) => {
      // Si tiene una URL completa en la DB, usarla
      if (team.logo_url && team.logo_url.startsWith('http')) return team.logo_url;
      
      // Si no, construirla basándonos en el slug y la URL base actual
      const slug = team.name.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9_]/g, '');
      
      return `${baseUrl}/logos/${slug}.png`;
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
            justifyContent: 'space-between',
            backgroundColor: '#111415',
            position: 'relative',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Background Image with Overlay */}
          <img 
            src={stadiumBg} 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              opacity: 0.4 
            }} 
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to bottom, #111415ee 0%, transparent 40%, transparent 60%, #111415 95%)' 
          }} />

          {/* Top Header */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            marginTop: '120px', 
            zIndex: 10 
          }}>
             <div style={{ display: 'flex', background: '#604403aa', padding: '15px', borderRadius: '50%', border: '2px solid #e9c176', marginBottom: '20px' }}>
                <img src={`${baseUrl}/logos/league_logo.png`} width="100" height="100" style={{ objectFit: 'contain' }} />
             </div>
             <p style={{ color: '#e9c176', fontSize: 24, fontWeight: 'bold', letterSpacing: '8px', marginBottom: '10px' }}>SÚPER LIGA BSC</p>
             <div style={{ height: '4px', width: '120px', background: '#e9c176' }}></div>
          </div>

          {/* VS Content */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%', 
            zIndex: 10,
            padding: '0 60px'
          }}>
            {/* Home Team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'flex', width: '280px', height: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '40px', border: '2px solid #e9c17644', alignItems: 'center', justifyContent: 'center', padding: '30px', marginBottom: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <img src={getTeamLogoUrl(match.home_team)} width="200" height="200" style={{ objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: 54, color: 'white', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-2px' }}>{match.home_team.name}</h2>
            </div>

            {/* VS Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', margin: '20px 0' }}>
               <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to right, transparent, #e9c176)' }}></div>
               <div style={{ fontSize: 80, fontWeight: '900', color: '#e9c176', fontStyle: 'italic', opacity: 0.9 }}>VS</div>
               <div style={{ height: '2px', width: '100px', background: 'linear-gradient(to left, transparent, #e9c176)' }}></div>
            </div>

            {/* Away Team */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
              <div style={{ display: 'flex', width: '280px', height: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '40px', border: '2px solid #e9c17644', alignItems: 'center', justifyContent: 'center', padding: '30px', marginBottom: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <img src={getTeamLogoUrl(match.away_team)} width="200" height="200" style={{ objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: 54, color: 'white', fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-2px' }}>{match.away_team.name}</h2>
            </div>
          </div>

          {/* Bottom Match Info */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%', 
            background: 'rgba(233,193,118,0.1)', 
            padding: '60px 20px 100px 20px', 
            borderTop: '2px solid #e9c17644',
            zIndex: 10
          }}>
            <p style={{ fontSize: 32, color: 'white', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '10px' }}>{date}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <span style={{ color: '#e9c176', fontSize: 36, fontWeight: '900' }}>21:00 HRS</span>
               <span style={{ color: 'white', fontSize: 30, opacity: 0.5 }}>|</span>
               <span style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>LA CURTIEMBRE</span>
            </div>
          </div>
        </div>
      ),
      { width: 1080, height: 1920 }
    );
  } catch (e: any) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}
