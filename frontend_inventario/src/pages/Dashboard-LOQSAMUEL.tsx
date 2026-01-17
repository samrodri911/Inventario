import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { itemsService } from '../services/items.service';
import { categoriesService } from '../services/categories.service';
import { stockMovementsService } from '../services/stock-movements.service';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';

function Dashboard() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalMovements: 0,
    lowStockItems: 0,
  });
  
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [movementStats, setMovementStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [itemsStats, categories, lowStock, movements, movStats] = await Promise.all([
        itemsService.getStats(),
        categoriesService.getAll(),
        itemsService.getLowStock(),
        stockMovementsService.getAll(),
        stockMovementsService.getStats(),
      ]);

      setStats({
        totalItems: itemsStats.totalItems,
        totalCategories: categories.length,
        totalMovements: movStats.totalMovements,
        lowStockItems: itemsStats.lowStockItems,
      });

      setLowStockProducts(lowStock.slice(0, 5));
      setRecentMovements(movements.slice(0, 5));
      setMovementStats(movStats);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900 z-[999]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-300 font-bold tracking-widest text-xs uppercase text-center">
            Sincronizando<br/>Inventario
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8fafc] overflow-x-hidden">
      
      {/* Fondo decorativo fijo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* HEADER FIJO */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            
            {/* AREA DE USUARIO */}
            <div className="flex items-center gap-4 group cursor-default">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-2xl opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 overflow-hidden">
                  <span className="text-3xl font-black leading-none flex items-center justify-center h-full w-full select-none translate-y-[1px]">
                    {user?.displayName?.[0] || user?.email[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h2 className="text-lg font-black text-slate-800 leading-tight">
                  {user?.displayName || 'Usuario'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex items-center gap-3">
              
              {/* MENÚ DESPLEGABLE "NUEVO" */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-6 py-3 bg-white !bg-white text-indigo-600 text-sm font-black rounded-2xl border-2 border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                >
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="uppercase tracking-tight text-indigo-600">Nuevo</span>
                  <svg 
                    className={`w-3 h-3 text-indigo-600 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* MENÚ DESPLEGABLE */}
                {isMenuOpen && (
                  <>
                    {/* Capa invisible para cerrar al hacer clic fuera */}
                    <div 
                      className="fixed inset-0 z-[90] bg-transparent cursor-default" 
                      onClick={() => setIsMenuOpen(false)}
                    ></div>

                    {/* Contenedor del Menú */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100]">
                      <Link
                        to="/items/new"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-indigo-50 transition-colors border-b border-slate-100 group"
                      >
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-sm">Producto</p>
                          <p className="text-[10px] text-slate-500 font-bold">Agregar nuevo item</p>
                        </div>
                      </Link>

                      <Link
                        to="/categories/new"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-purple-50 transition-colors border-b border-slate-100 group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-sm">Categoría</p>
                          <p className="text-[10px] text-slate-500 font-bold">Crear clasificación</p>
                        </div>
                      </Link>

                      <Link
                        to="/movements/new?type=IN"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-emerald-50 transition-colors border-b border-slate-100 group"
                      >
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-sm">Entrada</p>
                          <p className="text-[10px] text-slate-500 font-bold">Registrar ingreso de stock</p>
                        </div>
                      </Link>

                      <Link
                        to="/movements/new?type=OUT"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-slate-800 text-sm">Salida</p>
                          <p className="text-[10px] text-slate-500 font-bold">Registrar retiro de stock</p>
                        </div>
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* BOTÓN SALIR */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-white !bg-white text-red-600 text-sm font-black rounded-2xl border-2 border-red-600 hover:bg-red-50 transition-all shadow-sm active:scale-95"
              >
                <span className="uppercase tracking-tight text-red-600">Salir</span>
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            Panel de Control<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Gestión centralizada de stock y movimientos.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Productos"
            value={stats.totalItems}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            color="blue"
          />
          <StatCard
            title="Categorías"
            value={stats.totalCategories}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            color="purple"
          />
          <StatCard
            title="Movimientos"
            value={stats.totalMovements}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            color="indigo"
          />
          <StatCard
            title="Bajo Stock"
            value={stats.lowStockItems}
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            color={stats.lowStockItems > 0 ? 'red' : 'green'}
          />
        </div>

        {movementStats && (
          <Card className="p-8 mb-10 border-none shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <span className="w-12 h-[1px] bg-slate-200"></span>
              Análisis de Inventario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="border-l-4 border-emerald-500 pl-6">
                <p className="text-xs font-black text-emerald-600 uppercase mb-1">Entradas de Stock</p>
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{movementStats.entries.totalQuantity}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold italic">Total de {movementStats.entries.count} ingresos</p>
              </div>
              <div className="border-l-4 border-rose-500 pl-6">
                <p className="text-xs font-black text-rose-600 uppercase mb-1">Salidas de Stock</p>
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{movementStats.exits.totalQuantity}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold italic">Total de {movementStats.exits.count} retiros</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-200">
                <p className="text-xs font-black text-indigo-400 uppercase mb-1 tracking-wider">Balance del Período</p>
                <p className={`text-4xl font-black ${movementStats.netChange >= 0 ? 'text-white' : 'text-orange-500'}`}>
                  {movementStats.netChange > 0 ? '+' : ''}{movementStats.netChange}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase italic">Variación de unidades</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter underline decoration-indigo-500/30 underline-offset-8">Actividad</h3>
              <Link to="/movements" className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">Ver Historial →</Link>
            </div>
            <div className="grid gap-4">
              {recentMovements.length > 0 ? (
                recentMovements.map((m) => (
                  <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:border-indigo-100 transition-all group">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {m.type === 'IN' ? '↓' : '↑'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm">{m.item?.name || 'Producto'}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-tighter">
                        Cant: {m.quantity} • {m.type === 'IN' ? 'Entrada' : 'Salida'}
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-500 transition-colors">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No hay movimientos registrados</p>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter underline decoration-red-500/30 underline-offset-8">
                Alertas
              </h3>
              <Link to="/items?filter=low-stock" className="text-[10px] font-black text-red-600 hover:text-red-800 transition-colors uppercase tracking-widest">
                Gestionar Todo →
              </Link>
            </div>

            <div className="grid gap-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl border border-red-100 flex items-center justify-between group hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-red-200 animate-pulse">
                        !
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-base uppercase tracking-tight leading-none mb-1">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-md border border-red-100">
                            Stock Bajo
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                            Mínimo requerido: {item.minStock}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-red-600 group-hover:border-red-600 transition-colors duration-300">
                      <span className="text-2xl font-black text-red-600 group-hover:text-white transition-colors">
                        {item.currentStock}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 group-hover:text-red-100 uppercase tracking-tighter transition-colors">
                        Unidades
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-emerald-50/50 p-10 rounded-[2.5rem] border border-emerald-100 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-emerald-700 font-black text-sm uppercase tracking-widest">
                    Inventario sin alertas
                  </p>
                  <p className="text-emerald-600/60 text-[10px] font-bold uppercase mt-1">
                    No hay productos bajo el mínimo
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;