import './StatCard.css';

export default function StatCard({ title, value, icon, trend, trendPositive }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
        {trend && (
          <span className={`stat-trend ${trendPositive ? 'positive' : 'negative'}`}>
            {trendPositive ? '▲' : '▼'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
