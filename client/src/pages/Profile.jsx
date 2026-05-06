import { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Trophy, Target, Swords, Percent, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, API } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API}/game/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const winRate = user?.gamesPlayed
    ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
    : 0;

  const stats = [
    { label: 'BEST SCORE',   value: user?.bestScore?.toLocaleString()  ?? 0, color: 'var(--gold)',  icon: <Trophy  size={14} /> },
    { label: 'TOTAL SCORE',  value: user?.totalScore?.toLocaleString() ?? 0, color: 'var(--green)', icon: <Star    size={14} /> },
    { label: 'GAMES PLAYED', value: user?.gamesPlayed ?? 0,                  color: 'var(--text)',  icon: <Swords  size={14} /> },
    { label: 'GAMES WON',    value: user?.gamesWon    ?? 0,                  color: 'var(--green)', icon: <Target  size={14} /> },
    { label: 'WIN RATE',     value: `${winRate}%`,                           color: winRate > 50 ? 'var(--green)' : 'var(--red)', icon: <Percent size={14} /> },
  ];

  return (
    <div className="profile-root grid-bg fade-in">
      <div className="profile-inner">

        {/* ── Player card ── */}
        <div className="profile-card">
          {user?.picture
            ? <img src={user.picture} alt="" className="profile-avatar" />
            : <div className="profile-avatar-ph"><User size={34} /></div>
          }
          <div className="profile-info">
            <h2 className="profile-name glow">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            {user?.username && (
              <p className="profile-email" style={{ color: 'var(--green)', opacity: 0.75 }}>
                @{user.username}
              </p>
            )}
            <div className="profile-badges">
              {user?.age && (
                <span className="profile-badge">AGE {user.age}</span>
              )}
              {user?.gender && (
                <span className="profile-badge">
                  {user.gender === 'male' ? '♂ MALE' : user.gender === 'female' ? '♀ FEMALE' : '◈ OTHER'}
                </span>
              )}
              <span className="profile-badge">⚓ NAVAL COMMANDER</span>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="profile-stats">
          {stats.map(({ label, value, color, icon }) => (
            <div key={label} className="profile-stat-box">
              <div className="hud-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>{icon}</span>
                {label}
              </div>
              <div className="profile-stat-val" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Battle history ── */}
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
                    <td className={g.won ? 'result-win' : 'result-loss'}>{g.won ? '✓ VICTORY' : '✗ DEFEAT'}</td>
                    <td className="score-val">{g.score.toLocaleString()}</td>
                    <td>{g.hits}</td>
                    <td>{g.misses}</td>
                    <td>{g.shipsDestroyed}</td>
                    <td>{g.turns}</td>
                    <td><Clock size={10} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} />{g.durationSecs}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
