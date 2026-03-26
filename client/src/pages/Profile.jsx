import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, API }   = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bsw_token');
    axios.get(`${API}/game/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const winRate = user?.gamesPlayed
    ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
    : 0;

  return (
    <div className="profile-root grid-bg fade-in">
      {/* Player card */}
      <div className="profile-card">
        {user?.picture
          ? <img src={user.picture} alt="" className="profile-avatar" />
          : <div className="profile-avatar-ph">⚓</div>
        }
        <div className="profile-info">
          <h2 className="profile-name glow">{user?.name}</h2>
          <p className="profile-email">{user?.email}</p>
          <span className="profile-badge">NAVAL COMMANDER</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="profile-stats">
        {[
          ['BEST SCORE',   user?.bestScore?.toLocaleString() ?? 0,  'var(--gold)'],
          ['TOTAL SCORE',  user?.totalScore?.toLocaleString() ?? 0, 'var(--green)'],
          ['GAMES PLAYED', user?.gamesPlayed ?? 0,                  'var(--text)'],
          ['GAMES WON',    user?.gamesWon ?? 0,                     'var(--green)'],
          ['WIN RATE',     `${winRate}%`,                           winRate > 50 ? 'var(--green)' : 'var(--red)'],
        ].map(([label, value, color]) => (
          <div key={label} className="profile-stat-box">
            <div className="hud-label">{label}</div>
            <div className="profile-stat-val" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* History table */}
      <div className="profile-history">
        <h3 className="profile-section-title">RECENT BATTLES</h3>
        {loading ? (
          <p className="profile-loading pulse">LOADING...</p>
        ) : history.length === 0 ? (
          <p className="profile-empty">No battles yet. Go play!</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>RESULT</th>
                <th>SCORE</th>
                <th>HITS</th>
                <th>MISSES</th>
                <th>SHIPS SUNK</th>
                <th>TURNS</th>
                <th>TIME</th>
              </tr>
            </thead>
            <tbody>
              {history.map(g => (
                <tr key={g._id} className={`history-row ${g.won ? 'history-win' : 'history-loss'}`}>
                  <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                  <td className={g.won ? 'result-win' : 'result-loss'}>{g.won ? 'VICTORY' : 'DEFEAT'}</td>
                  <td className="score-val">{g.score.toLocaleString()}</td>
                  <td>{g.hits}</td>
                  <td>{g.misses}</td>
                  <td>{g.shipsDestroyed}</td>
                  <td>{g.turns}</td>
                  <td>{g.durationSecs}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
