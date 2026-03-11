import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './TransactionList.css';

export default function TransactionList({ transacciones, onEdit, onDelete }) {
  return (
    <div className="transaction-list">
      <h3>Últimas transacciones</h3>
      <div className="transactions">
        {transacciones.map((t) => (
          <div key={t.id} className="transaction-item">
            <div className="transaction-info">
              <span className="transaction-desc">{t.descripcion}</span>
              <span className="transaction-date">{t.fecha}</span>
            </div>
            <div className="transaction-right">
              <span className={`transaction-amount ${t.monto >= 0 ? 'positive' : 'negative'}`}>
                {t.monto >= 0 ? '+' : ''}{t.monto.toLocaleString('es-AR')} $
              </span>
              <div className="transaction-actions">
                <button className="btn-edit" onClick={() => onEdit(t)} title="Editar">
                  <FiEdit2 />
                </button>
                <button className="btn-delete" onClick={() => onDelete(t)} title="Eliminar">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
