interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  const colorGradients = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    yellow: 'from-amber-400 to-amber-500 shadow-amber-500/20',
    red: 'from-rose-500 to-rose-600 shadow-rose-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
  };

  return (
    <div className="group relative bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/40 shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        {/* Icono con gradiente y efecto Glow */}
        <div className={`bg-gradient-to-br ${colorGradients[color]} p-3 rounded-xl text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>

        {/* Tendencia estilizada */}
        {trend && (
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${
            trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">{title}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-2 italic">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default StatCard;