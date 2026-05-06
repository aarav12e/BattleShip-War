import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Target, Percent, Gamepad2, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { user, API } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API}/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setLeaders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lb-root grid-bg fade-in">
      <div className="lb-header">
        <Trophy size={28} style={{ color: 'var(--gold)', filter: 'drop-shadow(0 0 8px var(--gold))', marginBottom: '0.5rem' }} />
        <h1 className="lb-title glow">LEADERBOARD</h1>
        <p className="lb-sub">TOP NAVAL COMMANDERS</p>
      </div>

      {loading ? (
        <div className="lb-loading pulse">LOADING DATA...</div>
      ) : (
        <>
          {/* ── Desktop: full table ── */}
          <div className="lb-table-wrap lb-desktop-only">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>COMMANDER</th>
                  <th>BEST SCORE</th>
                  <th>TOTAL SCORE</th>
                  <th>WIN RATE</th>
                  <th>GAMES</th>
                  <th>WINS</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((p, i) => {
                  const isMe = p.email === user?.email;
                  return (
                    <tr key={p.email} className={`lb-row ${isMe ? 'lb-me' : ''}`}>
                      <td className="lb-rank">
                        {i < 3 ? <span className="lb-medal">{MEDALS[i]}</span> : `#${p.rank}`}
                      </td>
                      <td className="lb-player">
                        {p.picture
                          ? <img src={p.picture} alt="" className="lb-avatar" />
                          : <span className="lb-avatar-placeholder">⚓</span>
                        }
                        <div>
                          <div className="lb-name">{p.name} {isMe && <span className="lb-you">YOU</span>}</div>
                          <div className="lb-email">{p.email}</div>
                        </div>
                      </td>
                      <td className="lb-score gold">{p.bestScore.toLocaleString()}</td>
                      <td className="lb-score">{p.totalScore.toLocaleString()}</td>
                      <td className="lb-rate">
                        <div className="lb-bar-wrap">
                          <div className="lb-bar" style={{ width: `${p.winRate}%` }} />
                          <span>{p.winRate}%</span>
                        </div>
                      </td>
                      <td className="lb-num">{p.gamesPlayed}</td>
                      <td className="lb-num green">{p.gamesWon}</td>
                    </tr>
                  );
                })}
                {leaders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="lb-empty">No battles recorded yet. Be the first!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile: card layout ── */}
          <div className="lb-cards lb-mobile-only">
            {leaders.length === 0 && (
              <div className="lb-empty-card">No battles recorded yet. Be the first!</div>
            )}
            {leaders.map((p, i) => {
              const isMe = p.email === user?.email;
              return (
                <div key={p.email} className={`lb-card ${isMe ? 'lb-card-me' : ''}`}>
                  {/* Card header: rank + name */}
                  <div className="lb-card-header">
                    <div className="lb-card-rank">
                      {i < 3
                        ? <span className="lb-medal">{MEDALS[i]}</span>
                        : <span className="lb-card-num">#{p.rank}</span>
                      }
                    </div>
                    <div className="lb-card-identity">
                      {p.picture
                        ? <img src={p.picture} alt="" className="lb-card-avatar" />
                        : <div className="lb-card-avatar-ph">⚓</div>
                      }
                      <div>
                        <div className="lb-card-name">
                          {p.name}
                          {isMe && <span className="lb-you">YOU</span>}
                        </div>
                        <div className="lb-card-email">{p.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card stats grid */}
                  <div className="lb-card-stats">
                    <div className="lb-card-stat">
                      <div className="lb-card-stat-label">
                        <Crown size={10} /> BEST
                      </div>
                      <div className="lb-card-stat-val gold">{p.bestScore.toLocaleString()}</div>
                    </div>
                    <div className="lb-card-stat">
                      <div className="lb-card-stat-label">
                        <Target size={10} /> TOTAL
                      </div>
                      <div className="lb-card-stat-val">{p.totalScore.toLocaleString()}</div>
                    </div>
                    <div className="lb-card-stat">
                      <div className="lb-card-stat-label">
                        <Percent size={10} /> WIN%
                      </div>
                      <div className="lb-card-stat-val green">{p.winRate}%</div>
                    </div>
                    <div className="lb-card-stat">
                      <div className="lb-card-stat-label">
                        <Gamepad2 size={10} /> GAMES
                      </div>
                      <div className="lb-card-stat-val">{p.gamesPlayed}</div>
                    </div>
                  </div>

                  {/* Win rate bar */}
                  <div className="lb-card-bar-wrap">
                    <div className="lb-card-bar-bg">
                      <div className="lb-card-bar-fill" style={{ width: `${p.winRate}%` }} />
                    </div>
                    <span className="lb-card-bar-label">{p.winRate}% win rate</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
