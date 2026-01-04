import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stockMovementsService } from '../services/stock-movements.service';
import type { StockMovement } from '../types';

function MovementsList() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await stockMovementsService.getAll();
      setMovements(data);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar movimientos
  const filteredMovements = movements.filter(movement => {
    // Filtro por tipo
    const matchesType = filterType === 'ALL' || movement.type === filterType;
    
    // Filtro por búsqueda
    const matchesSearch = 
      movement.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.item?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por fecha
    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const movementDate = new Date(movement.createdAt);
      const now = new Date();
      
      if (dateFilter === 'TODAY') {
        matchesDate = movementDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'WEEK') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = movementDate >= weekAgo;
      } else if (dateFilter === 'MONTH') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = movementDate >= monthAgo;
      }
    }
    
    return matchesType && matchesSearch && matchesDate;
  });

  // Calcular estadísticas de los movimientos filtrados
  const stats = {
    totalEntries: filteredMovements.filter(m => m.type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
    totalExits: filteredMovements.filter(m => m.type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
    entriesCount: filteredMovements.filter(m => m.type === 'IN').length,
    exitsCount: filteredMovements.filter(m => m.type === 'OUT').length,
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-black tracking-widest text-xs uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] pb-20">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* NAVEGACIÓN */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Link to="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600">Movimientos</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Movimientos<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">
              Historial completo de entradas y salidas
            </p>
          </div>

          <Link
            to="/movements/new"
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-white text-sm font-black uppercase tracking-widest">Nuevo Movimiento</span>
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl">
                🔄
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">Total</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{filteredMovements.length}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Registros</p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                ⬇️
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase bg-emerald-100 px-2 py-1 rounded">Entradas</span>
            </div>
            <p className="text-4xl font-black text-emerald-700">{stats.totalEntries}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">{stats.entriesCount} movimientos</p>
          </div>

          <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                ⬆️
              </div>
              <span className="text-[10px] font-black text-red-600 uppercase bg-red-100 px-2 py-1 rounded">Salidas</span>
            </div>
            <p className="text-4xl font-black text-red-700">{stats.totalExits}</p>
            <p className="text-[10px] font-bold text-red-600 uppercase mt-1">{stats.exitsCount} movimientos</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                📊
              </div>
              <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">Balance</span>
            </div>
            <p className={`text-4xl font-black ${stats.totalEntries - stats.totalExits >= 0 ? 'text-white' : 'text-orange-300'}`}>
              {stats.totalEntries - stats.totalExits > 0 ? '+' : ''}{stats.totalEntries - stats.totalExits}
            </p>
            <p className="text-[10px] font-bold opacity-80 uppercase mt-1">Neto</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Buscador */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Producto, usuario o razón..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700 shadow-inner"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filtro por Tipo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Movimiento</label>
              <div className="flex gap-2">
                {(['ALL', 'IN', 'OUT'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase transition-all border-2 ${
                      filterType === type
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-600'
                    }`}
                  >
                    {type === 'ALL' ? 'Todos' : type === 'IN' ? '⬇️ Entrada' : '⬆️ Salida'}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro por Fecha */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Período</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none cursor-pointer shadow-inner"
              >
                <option value="ALL">Todo el historial</option>
                <option value="TODAY">Hoy</option>
                <option value="WEEK">Última semana</option>
                <option value="MONTH">Último mes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Movimientos */}
        <div className="space-y-3">
          {filteredMovements.length > 0 ? (
            filteredMovements.map((movement) => (
              <div
                key={movement.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  
                  {/* Tipo de Movimiento */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                    movement.type === 'IN' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {movement.type === 'IN' ? '⬇️' : '⬆️'}
                  </div>

                  {/* Info del Producto */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/items/${movement.itemId}`}
                        className="font-black text-slate-900 text-base uppercase tracking-tight hover:text-indigo-600 transition-colors"
                      >
                        {movement.item?.name || 'Producto Desconocido'}
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        movement.type === 'IN'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {movement.type === 'IN' ? 'Entrada' : 'Salida'}
                      </span>
                    </div>
                    
                    {movement.item?.sku && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        SKU: {movement.item.sku}
                      </p>
                    )}
                    
                    {movement.reason && (
                      <p className="text-sm text-slate-700 font-medium">
                        <span className="text-slate-400 font-bold">Razón:</span> {movement.reason}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                      {movement.user && (
                        <span className="flex items-center gap-1">
                          👤 {movement.user.displayName || movement.user.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        📅 {new Date(movement.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className={`text-center px-8 py-4 rounded-2xl border-2 min-w-[120px] ${
                    movement.type === 'IN'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`text-4xl font-black ${
                      movement.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Unidades
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-200 shadow-inner">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] mb-4">
                No se encontraron movimientos
              </p>
              {(searchTerm || filterType !== 'ALL' || dateFilter !== 'ALL') ? (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('ALL');
                    setDateFilter('ALL');
                  }}
                  style={{ backgroundColor: 'white', color: '#4f46e5', borderColor: '#4f46e5' }}
                  className="mt-2 px-10 py-4 border-2 rounded-2xl font-black text-xs uppercase transition-all hover:bg-indigo-50"
                >
                  Limpiar Filtros
                </button>
              ) : (
                <Link
                  to="/movements/new"
                  style={{ backgroundColor: '#4f46e5', color: 'white', borderColor: '#4f46e5' }}
                  className="inline-block mt-2 px-10 py-4 border-2 rounded-2xl font-black text-xs uppercase transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  Registrar Primer Movimiento
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MovementsList;