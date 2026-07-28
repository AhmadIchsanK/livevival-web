'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    const { data } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
    if (data) setMatches(data);
  }

  async function handleCreateMatch(e) {
    e.preventDefault();
    if (!teamA || !teamB || !streamUrl) return alert('Please fill in all fields');

    const { error } = await supabase.from('matches').insert([
      {
        team_a_name: teamA,
        team_b_name: teamB,
        youtube_url: streamUrl,
        status: 'upcoming'
      }
    ]);

    if (error) {
      alert('Error creating match: ' + error.message);
    } else {
      setTeamA('');
      setTeamB('');
      setStreamUrl('');
      fetchMatches();
    }
  }

  async function setMatchLive(matchId) {
    // Set all matches to 'completed' or 'upcoming', then set chosen one to 'live'
    await supabase.from('matches').update({ status: 'completed' }).neq('id', matchId);
    await supabase.from('matches').update({ status: 'live' }).eq('id', matchId);
    fetchMatches();
  }

  async function setMatchEnded(matchId) {
    await supabase.from('matches').update({ status: 'completed' }).eq('id', matchId);
    fetchMatches();
  }

  return (
    <main style={{ backgroundColor: '#0f172a', color: '#fff', minHeight: '100vh', padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#38bdf8', marginBottom: '8px' }}>Livevival Admin Control</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Manage active MLBB matches and YouTube live streams</p>

        {/* Create Match Form */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>Create New Match</h2>
          <form onSubmit={handleCreateMatch} style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Team A Name (e.g. ONIC Esports)"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
              <input
                type="text"
                placeholder="Team B Name (e.g. RRQ Hoshi)"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
              />
            </div>
            <input
              type="url"
              placeholder="YouTube Live Stream URL"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
            <button type="submit" style={{ padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Create Match
            </button>
          </form>
        </div>

        {/* Match List */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', marginTop: 0 }}>Match Management</h2>
          {matches.length === 0 ? (
            <p style={{ color: '#64748b' }}>No matches created yet.</p>
          ) : (
            matches.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', padding: '12px 0' }}>
                <div>
                  <strong>{m.team_a_name} vs {m.team_b_name}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Status: <span style={{ color: m.status === 'live' ? '#ef4444' : '#a855f7', fontWeight: 'bold' }}>{m.status.toUpperCase()}</span></div>
                </div>
                <div>
                  {m.status !== 'live' && (
                    <button onClick={() => setMatchLive(m.id)} style={{ padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>
                      Go LIVE
                    </button>
                  )}
                  {m.status === 'live' && (
                    <button onClick={() => setMatchEnded(m.id)} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      End Match
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
                       }
