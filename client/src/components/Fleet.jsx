import { SHIP_DEFS } from '../utils/gameLogic';
import './Fleet.css';

export default function Fleet({ label, ships = [] }) {
  return (
    <div className="fleet-panel">
      <div className="fleet-title">{label || 'YOUR FLEET'}</div>
      <div className="fleet-list">
        {SHIP_DEFS.map(def => {
          const ship = ships.find(s => s.id === def.id);
          const sunk = ship?.sunk ?? false;

          return (
            <div key={def.id} className={`fleet-ship ${sunk ? 'fleet-sunk' : 'fleet-alive'}`}>
              <div className="fleet-ship-info">
                <span className="fleet-symbol">{def.symbol}</span>
                <div>
                  <div className="fleet-ship-name">{def.name}</div>
                  <div className="fleet-ship-size">▪ × {def.size}</div>
                </div>
              </div>
              <div className={`fleet-status ${sunk ? 'status-sunk' : 'status-ok'}`}>
                {sunk ? 'SUNK' : 'ACTIVE'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
