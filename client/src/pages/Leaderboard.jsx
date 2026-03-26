import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { user, API }  = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bsw_token');
    axios.get(`${API}/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setLeaders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lb-root grid-bg fade-in">
      <div className="lb-header">
        <h1 className="lb-title glow">🏅 LEADERBOARD</h1>
        <p className="lb-sub">TOP NAVAL COMMANDERS</p>
      </div>

      {loading ? (
        <div className="lb-loading pulse">LOADING DATA...</div>
      ) : (
        <div className="lb-table-wrap">
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
                        <div className="lb-bar" style={{width:`${p.winRate}%`}} />
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
      )}
    </div>
  );
}
