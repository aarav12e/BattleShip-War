import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Grid from '../components/Grid';
import Fleet from '../components/Fleet';
import {
  ROWS, COLS, SHIP_DEFS, cellKey,
  getShipCells, placeShipsRandomly, buildShipMap,
  calcScore, AIPlayer,
} from '../utils/gameLogic';
import './Game.css';

// ── Phase constants ────────────────────────────────────────────────
const PHASE = { PLACEMENT: 'placement', BATTLE: 'battle', GAMEOVER: 'gameover' };

const INIT_PLACEMENT = () => ({
  ships:       [],
  currentIdx:  0,
  horizontal:  true,
  hoverCells:  [],
  hoverValid:  true,
});

export default function Game() {
  const { user, API } = useAuth();

  // ── Phase & placement ──────────────────────────────────────────
  const [phase,     setPhase]     = useState(PHASE.PLACEMENT);
  const [placement, setPlacement] = useState(INIT_PLACEMENT());

  // ── Battle state ───────────────────────────────────────────────
  const [playerShips,   setPlayerShips]   = useState([]);  // placed ships
  const [playerShipMap, setPlayerShipMap] = useState({});
  const [playerShots,   setPlayerShots]   = useState({});  // AI shots at player

  const [enemyShips,    setEnemyShips]    = useState([]);  // AI ships (hidden)
  const [enemyShipMap,  setEnemyShipMap]  = useState({});
  const [enemyShots,    setEnemyShots]    = useState({});  // player shots at AI

  const [turn,     setTurn]     = useState('player');  // 'player' | 'ai'
  const [log,      setLog]      = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [result,   setResult]   = useState(null);     // { won, score, ... }

  // ── Timers / counters ──────────────────────────────────────────
  const [turnCount,    setTurnCount]    = useState(0);
  const [hitCount,     setHitCount]     = useState(0);
  const [missCount,    setMissCount]    = useState(0);
  const startTime = useRef(Date.now());

  const aiRef = useRef(new AIPlayer());
  const logRef = useRef(null);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = (msg, type = 'info') =>
    setLog(prev => [...prev.slice(-60), { msg, type, id: Date.now() + Math.random() }]);

  // ── Place ships randomly ───────────────────────────────────────
  const autoPlace = () => {
    const ships = placeShipsRandomly();
    setPlacement({ ships, currentIdx: SHIP_DEFS.length, horizontal: true, hoverCells: [], hoverValid: true });
  };

  // ── Hover preview during placement ────────────────────────────
  const onPlacementHover = (r, c) => {
    const def = SHIP_DEFS[placement.currentIdx];
    if (!def) return;
    const cells = getShipCells(r, c, def.size, placement.horizontal);
    if (!cells) { setPlacement(p => ({ ...p, hoverCells: [], hoverValid: false })); return; }
    const occupied = new Set(placement.ships.flatMap(s => s.cells));
    const valid = cells.every(cell => !occupied.has(cell));
    setPlacement(p => ({ ...p, hoverCells: cells, hoverValid: valid }));
  };

  // ── Place one ship ─────────────────────────────────────────────
  const onPlacementClick = (r, c) => {
    const def = SHIP_DEFS[placement.currentIdx];
    if (!def) return;
    const cells = getShipCells(r, c, def.size, placement.horizontal);
    if (!cells) return;
    const occupied = new Set(placement.ships.flatMap(s => s.cells));
    if (cells.some(cell => occupied.has(cell))) return;

    const newShip = { ...def, cells, horizontal: placement.horizontal, sunk: false };
    setPlacement(p => ({
      ...p,
      ships:      [...p.ships, newShip],
      currentIdx: p.currentIdx + 1,
      hoverCells: [],
    }));
  };

  // ── Remove last ship ──────────────────────────────────────────
  const undoPlacement = () => {
    setPlacement(p => ({
      ...p,
      ships:      p.ships.slice(0, -1),
      currentIdx: Math.max(0, p.currentIdx - 1),
      hoverCells: [],
    }));
  };

  // ── Start battle ──────────────────────────────────────────────
  const startBattle = () => {
    if (placement.ships.length < SHIP_DEFS.length) return;
    const aiShips = placeShipsRandomly();
    setPlayerShips(placement.ships);
    setPlayerShipMap(buildShipMap(placement.ships));
    setEnemyShips(aiShips);
    setEnemyShipMap(buildShipMap(aiShips));
    aiRef.current = new AIPlayer();
    startTime.current = Date.now();
    setPhase(PHASE.BATTLE);
    addLog('⚓ Battle commenced! Fire at will, Commander!', 'system');
  };

  // ── Check win/lose ─────────────────────────────────────────────
  const checkGameOver = useCallback((pShips, eShips, pShots, eShots) => {
    const playerWon = eShips.every(s => s.sunk);
    const aiWon     = pShips.every(s => s.sunk);
    if (!playerWon && !aiWon) return false;

    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    const stats = {
      hits:           hitCount,
      misses:         missCount,
      shipsDestroyed: eShips.filter(s => s.sunk).length,
      won:            playerWon,
      turns:          turnCount,
      durationSecs:   elapsed,
    };
    const score = calcScore(stats);
    setResult({ ...stats, score });
    setPhase(PHASE.GAMEOVER);
    return true;
  }, [hitCount, missCount, turnCount]);

  // ── Player fires ──────────────────────────────────────────────
  const onPlayerFire = useCallback((r, c) => {
    if (turn !== 'player' || phase !== PHASE.BATTLE) return;
    const key     = cellKey(r, c);
    if (enemyShots[key]) return;

    const shipId  = enemyShipMap[key];
    const isHit   = Boolean(shipId);

    // Update shots
    const newShots = { ...enemyShots, [key]: isHit ? 'hit' : 'miss' };
    setEnemyShots(newShots);

    if (isHit) {
      setHitCount(h => h + 1);
      addLog(`🎯 HIT at ${key}!`, 'hit');
    } else {
      setMissCount(m => m + 1);
      addLog(`💧 MISS at ${key}.`, 'miss');
    }

    // Check if ship sunk
    let updatedEnemyShips = enemyShips;
    let isSunk = false;
    if (isHit) {
      updatedEnemyShips = enemyShips.map(s => {
        if (s.id !== shipId) return s;
        const allHit = s.cells.every(cell => newShots[cell] === 'hit');
        if (allHit) { isSunk = true; return { ...s, sunk: true }; }
        return s;
      });
      setEnemyShips(updatedEnemyShips);
      if (isSunk) {
        const def = SHIP_DEFS.find(d => d.id === shipId);
        addLog(`💥 ENEMY ${def?.name} SUNK!`, 'sunk');
      }
    }

    setTurnCount(t => t + 1);

    // Check win
    if (updatedEnemyShips.every(s => s.sunk)) {
      setTimeout(() => checkGameOver(playerShips, updatedEnemyShips, playerShots, newShots), 200);
      return;
    }

    setTurn('ai');
    setTimeout(() => doAITurn(newShots, updatedEnemyShips), 700);
  }, [turn, phase, enemyShots, enemyShipMap, enemyShips, playerShips, playerShots, checkGameOver]);

  // ── AI fires ──────────────────────────────────────────────────
  const doAITurn = useCallback((currentEnemyShots, currentEnemyShips) => {
    const key    = aiRef.current.nextShot();
    const shipId = playerShipMap[key];
    const isHit  = Boolean(shipId);

    const newShots = { ...playerShots, [key]: isHit ? 'hit' : 'miss' };
    setPlayerShots(newShots);

    let isSunk = false;
    let updatedPlayerShips = playerShips;
    if (isHit) {
      updatedPlayerShips = playerShips.map(s => {
        if (s.id !== shipId) return s;
        const allHit = s.cells.every(cell => newShots[cell] === 'hit');
        if (allHit) { isSunk = true; return { ...s, sunk: true }; }
        return s;
      });
      setPlayerShips(updatedPlayerShips);
      if (isSunk) {
        const def = SHIP_DEFS.find(d => d.id === shipId);
        addLog(`🔥 Enemy sunk your ${def?.name}!`, 'enemy-sunk');
      } else {
        addLog(`⚠ Enemy hit your fleet at ${key}!`, 'enemy-hit');
      }
    } else {
      addLog(`〇 Enemy missed at ${key}.`, 'info');
    }

    aiRef.current.registerResult(key, isHit, isSunk);
    setTurnCount(t => t + 1);

    // Check lose
    if (updatedPlayerShips.every(s => s.sunk)) {
      setTimeout(() => checkGameOver(updatedPlayerShips, currentEnemyShips, newShots, currentEnemyShots), 200);
      return;
    }

    setTurn('player');
  }, [playerShipMap, playerShots, playerShips, checkGameOver]);

  // ── Save game & show result ────────────────────────────────────
  useEffect(() => {
    if (phase === PHASE.GAMEOVER && result && !saving) {
      setSaving(true);
      const token = localStorage.getItem('bsw_token');
      axios.post(`${API}/game/save`, result, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}).finally(() => setSaving(false));
    }
  }, [phase, result]);

  // ── Restart ───────────────────────────────────────────────────
  const restart = () => {
    setPhase(PHASE.PLACEMENT);
    setPlacement(INIT_PLACEMENT());
    setPlayerShips([]); setPlayerShipMap({}); setPlayerShots({});
    setEnemyShips([]);  setEnemyShipMap({});  setEnemyShots({});
    setTurn('player');  setLog([]);  setResult(null);
    setTurnCount(0); setHitCount(0); setMissCount(0);
    setSaving(false);
    startTime.current = Date.now();
  };

  // ── Placement grid map for preview ────────────────────────────
  const placementMap = buildShipMap(placement.ships);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="game-root grid-bg">

      {/* ── PLACEMENT PHASE ──────────────────────────────────── */}
      {phase === PHASE.PLACEMENT && (
        <div className="placement-layout fade-in">
          <div className="placement-header">
            <h2 className="phase-title glow">DEPLOY YOUR FLEET</h2>
            <p className="phase-sub">
              {placement.currentIdx < SHIP_DEFS.length
                ? `Place your ${SHIP_DEFS[placement.currentIdx].name} (${SHIP_DEFS[placement.currentIdx].size} cells)`
                : '✅ All ships placed — ready to battle!'}
            </p>
          </div>

          <div className="placement-controls">
            <button className="btn" onClick={() => setPlacement(p => ({ ...p, horizontal: !p.horizontal }))}>
              ROTATE: {placement.horizontal ? 'HORIZONTAL →' : 'VERTICAL ↓'}
            </button>
            <button className="btn" onClick={autoPlace}>AUTO PLACE</button>
            {placement.ships.length > 0 && (
              <button className="btn btn-danger" onClick={undoPlacement}>UNDO</button>
            )}
            {placement.currentIdx >= SHIP_DEFS.length && (
              <button className="btn btn-gold" onClick={startBattle}>⚔ START BATTLE</button>
            )}
          </div>

          <div className="placement-main">
            {/* Ship queue */}
            <div className="placement-queue">
              <div className="hud-label" style={{marginBottom:'0.5rem'}}>SHIPS TO PLACE</div>
              {SHIP_DEFS.map((def, i) => (
                <div key={def.id} className={`queue-item ${
                  i === placement.currentIdx ? 'queue-current' :
                  i < placement.currentIdx   ? 'queue-done' : 'queue-pending'
                }`}>
                  <span>{def.symbol}</span>
                  <span>{def.name}</span>
                  <span className="queue-size">{def.size}</span>
                  {i < placement.currentIdx && <span className="queue-check">✓</span>}
                </div>
              ))}
            </div>

            {/* Grid */}
            <Grid
              label="YOUR BOARD"
              ships={placement.ships}
              shipMap={placementMap}
              shots={{}}
              revealShips
              onCellClick={placement.currentIdx < SHIP_DEFS.length ? onPlacementClick : null}
              previewCells={placement.hoverCells}
              previewValid={placement.hoverValid}
            />
          </div>
        </div>
      )}

      {/* ── BATTLE PHASE ─────────────────────────────────────── */}
      {phase === PHASE.BATTLE && (
        <div className="battle-layout fade-in">

          {/* HUD bar */}
          <div className="battle-hud">
            <div className="hud-stat">
              <div className="hud-label">TURN</div>
              <div className="hud-value">{Math.ceil(turnCount / 2)}</div>
            </div>
            <div className="hud-stat">
              <div className="hud-label">HITS</div>
              <div className="hud-value" style={{color:'var(--red)'}}>{hitCount}</div>
            </div>
            <div className="hud-stat">
              <div className="hud-label">MISSES</div>
              <div className="hud-value" style={{color:'#006688'}}>{missCount}</div>
            </div>
            <div className="hud-stat">
              <div className="hud-label">SHIPS LEFT</div>
              <div className="hud-value" style={{color:'var(--gold)'}}>
                {enemyShips.filter(s => !s.sunk).length}
              </div>
            </div>
            <div className={`hud-turn-badge ${turn === 'player' ? 'turn-player' : 'turn-ai'}`}>
              {turn === 'player' ? '🎯 YOUR TURN' : '⚠ AI FIRING...'}
            </div>
          </div>

          {/* Grids */}
          <div className="battle-grids">
            <div className="battle-grid-wrap">
              <Grid
                label="ENEMY WATERS — CLICK TO FIRE"
                ships={enemyShips}
                shipMap={enemyShipMap}
                shots={enemyShots}
                onCellClick={onPlayerFire}
                disabled={turn !== 'player'}
                revealShips={false}
              />
            </div>
            <div className="battle-grid-wrap">
              <Grid
                label="YOUR WATERS"
                ships={playerShips}
                shipMap={playerShipMap}
                shots={playerShots}
                revealShips
                disabled
              />
            </div>
          </div>

          {/* Fleet panels + log */}
          <div className="battle-bottom">
            <Fleet label="YOUR FLEET"  ships={playerShips} />
            <div className="battle-log" ref={logRef}>
              <div className="hud-label" style={{marginBottom:'0.5rem'}}>BATTLE LOG</div>
              {log.map(entry => (
                <div key={entry.id} className={`log-entry log-${entry.type}`}>
                  {entry.msg}
                </div>
              ))}
            </div>
            <Fleet label="ENEMY FLEET" ships={enemyShips} />
          </div>
        </div>
      )}

      {/* ── GAME OVER ─────────────────────────────────────────── */}
      {phase === PHASE.GAMEOVER && result && (
        <div className="gameover-overlay fade-in">
          <div className="gameover-panel">
            <div className={`gameover-badge ${result.won ? 'won' : 'lost'}`}>
              {result.won ? '🏆 VICTORY' : '💀 DEFEAT'}
            </div>
            <h2 className={`gameover-title ${result.won ? 'glow' : 'glow-red'}`}>
              {result.won ? 'ENEMY FLEET DESTROYED' : 'FLEET ANNIHILATED'}
            </h2>

            <div className="gameover-stats">
              {[
                ['SCORE',     result.score,         'var(--gold)'],
                ['HITS',      result.hits,           'var(--red)'],
                ['MISSES',    result.misses,         '#006688'],
                ['SHIPS SUNK',result.shipsDestroyed, 'var(--green)'],
                ['TURNS',     Math.ceil(result.turns/2), 'var(--text)'],
                ['TIME',      `${result.durationSecs}s`, 'var(--text-dim)'],
              ].map(([label, value, color]) => (
                <div key={label} className="gameover-stat">
                  <div className="hud-label">{label}</div>
                  <div className="gameover-stat-val" style={{color}}>{value}</div>
                </div>
              ))}
            </div>

            <div className="gameover-actions">
              <button className="btn btn-gold" onClick={restart}>▶ PLAY AGAIN</button>
              <button className="btn" onClick={() => window.location.href = '/leaderboard'}>
                🏅 LEADERBOARD
              </button>
            </div>
            {saving && <p style={{color:'var(--text-dim)',fontSize:'0.6rem',marginTop:'0.5rem'}}>Saving score...</p>}
          </div>
        </div>
      )}
    </div>
  );
}
