'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LiveScorePage() {
  const [match, setMatch] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchActiveMatch() {
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'live')
        .limit(1);

      if (matches && matches.length > 0) {
        setMatch(matches[0]);
        fetchLatestStats(matches[0].id);
        listenToLiveUpdates(matches[0].id);
      }
    }

    async function fetchLatestStats(matchId) {
      const { data } = await supabase
        .from('live_game_states')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) setStats(data[0]);
    }

    function listenToLiveUpdates(matchId) {
      supabase
        .channel('realtime_stats')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'live_game_states', filter: `match_id=eq.${matchId}` },
          (payload) => {
            setStats(payload.new);
          }
        )
        .subscribe();
    }

    fetchActiveMatch();
  }, []);

  return (
    <main style={{ backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#38bdf8', letterSpacing: '2px', margin: 0 }}>LIVEVIVAL</h1>
        <p style={{ color: '#94a3b8', marginTop: '5px' }}>RevivalTV Esports Live Score</p>
      </header>

      {!match ? (
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#64748b' }}>
          <h2>No Live Match Currently Streaming</h2>
          <p>Check back during S-Tier / A-Tier MLBB Tournaments.</p>
        </div>
      ) : (
        <div style={{ maxWidth: '750px', margin: '0 auto', background: '#1e293b', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {/* Header Score Board */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#f43f5e' }}>{match.team_a_name}</h2>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '5px 0 0 0' }}>{stats?.team_a_kills || 0}</p>
            </div>
            
            <div style={{ padding: '0 15px' }}>
              <span style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>LIVE</span>
              <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginTop: '8px', fontWeight: '600' }}>{stats?.game_time || '00:00'}</p>
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.6rem', margin: 0, color: '#3b82f6' }}>{match.team_b_name}</h2>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '5px 0 0 0' }}>{stats?.team_b_kills || 0}</p>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px', textAlign: 'center' }}>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px' }}>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '0.9rem' }}>Team Gold</p>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{(stats?.team_a_gold || 0).toLocaleString()} vs {(stats?.team_b_gold || 0).toLocaleString()}</h3>
            </div>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px' }}>
              <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontSize: '0.9rem' }}>Towers Destroyed</p>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{stats?.team_a_towers || 0} - {stats?.team_b_towers || 0}</h3>
            </div>
          </div>

          {/* Key Events Feed */}
          {stats?.key_events && (
            <div style={{ marginTop: '20px', background: '#334155', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
              <strong style={{ color: '#f59e0b' }}>🔥 Key Moment: </strong> {stats.key_events}
            </div>
          )}
        </div>
      )}
    </main>
  );
            }
