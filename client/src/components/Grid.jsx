import { ROWS, COLS, cellKey } from '../utils/gameLogic';
import './Grid.css';

export default function Grid({
  label,
  ships       = [],
  shots       = {},      // { [cellKey]: 'hit' | 'miss' }
  shipMap     = {},      // { [cellKey]: shipId }
  onCellClick = null,
  hoverCell   = null,
  previewCells= [],      // cells being previewed (placement)
  previewValid= true,
  revealShips = false,
  disabled    = false,
}) {
  const sunkIds = new Set(
    ships.filter(s => s.sunk).map(s => s.id)
  );

  const getCellClass = (r, c) => {
    const key    = cellKey(r, c);
    const shot   = shots[key];
    const shipId = shipMap[key];
    const sunk   = shipId && sunkIds.has(shipId);

    const classes = ['grid-cell'];

    if (previewCells.includes(key)) {
      classes.push(previewValid ? 'preview-valid' : 'preview-invalid');
    } else if (shot === 'hit') {
      classes.push(sunk ? 'cell-sunk' : 'cell-hit');
    } else if (shot === 'miss') {
      classes.push('cell-miss');
    } else if (revealShips && shipId) {
      classes.push('cell-ship');
    }

    if (onCellClick && !disabled && !shot) classes.push('cell-clickable');

    return classes.join(' ');
  };

  return (
    <div className="grid-wrapper">
      {label && <div className="grid-label">{label}</div>}

      <div className="grid-container">
        {/* Top-left corner */}
        <div className="grid-corner" />

        {/* Column headers 1–14 */}
        {COLS.map(c => (
          <div key={c} className="grid-col-header">{c}</div>
        ))}

        {ROWS.map(r => (
          <>
            {/* Row header A–M */}
            <div key={`rh-${r}`} className="grid-row-header">{r}</div>

            {/* Cells */}
            {COLS.map(c => {
              const key = cellKey(r, c);
              const shot = shots[key];
              return (
                <div
                  key={key}
                  className={getCellClass(r, c)}
                  onClick={() => onCellClick && !disabled && !shot && onCellClick(r, c)}
                >
                  {shot === 'hit'  && <span className="cell-icon">✕</span>}
                  {shot === 'miss' && <span className="cell-dot">·</span>}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
