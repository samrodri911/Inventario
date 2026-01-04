import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { itemsService } from '../services/items.service';
import { categoriesService } from '../services/categories.service';
import type { Item, Category } from '../types';

function ItemsList() {
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    loadData();
    const filter = searchParams.get('filter');
    if (filter === 'low-stock') {
      setShowLowStockOnly(true);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        itemsService.getAll(),
        categoriesService.getAll(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await itemsService.delete(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === null || item.categoryId === selectedCategory;
    const matchesLowStock = !showLowStockOnly || item.currentStock <= item.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const getStockBadge = (item: Item) => {
    if (item.currentStock === 0) {
      return (
        <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-full border border-red-100">
          Agotado
        </span>
      );
    }
    if (item.currentStock <= item.minStock) {
      return (
        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full border border-amber-100">
          Bajo Stock
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
        Ok
      </span>
    );
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* NAVEGACIÓN RETROCESO (Breadcrumbs) */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
          <Link to="/dashboard" className="text-slate-400 hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-indigo-600">Inventario</span>
        </nav>

        {/* Header Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Inventario<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">
              Gestiona tus productos y existencias
            </p>
          </div>

          <Link
            to="/items/new"
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <svg className="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-white text-sm font-black uppercase tracking-widest">Nuevo Producto</span>
          </Link>
        </div>

        {/* Barra de Herramientas / Buscadores */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Buscador de Nombre */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar por Nombre o SKU</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Escribe aquí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-700 shadow-inner"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Buscador de Categorías */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtrar por Categoría</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none cursor-pointer shadow-inner"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Stock */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado de Alerta</label>
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                style={{ 
                  backgroundColor: 'white', 
                  color: showLowStockOnly ? '#4f46e5' : '#475569', 
                  borderColor: showLowStockOnly ? '#4f46e5' : '#e2e8f0',
                  boxShadow: showLowStockOnly ? '0 0 15px rgba(79, 70, 229, 0.1)' : 'none'
                }}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-tight transition-all border-2 flex items-center justify-center gap-2"
              >
                {showLowStockOnly ? (
                  <>
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                    Viendo Bajo Stock
                  </>
                ) : 'Ver solo Bajo Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Listado de Productos */}
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-5 border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                
                {/* Info Principal */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {item.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{item.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU: {item.sku || '---'}</p>
                  </div>
                </div>

                {/* Stock */}
                <div className="flex flex-row lg:flex-col items-center justify-center bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100 min-w-[100px]">
                  <span className="text-2xl font-black text-slate-900">{item.currentStock}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase lg:ml-0 ml-2 tracking-widest">Existencia</span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center min-w-[120px]">
                  {getStockBadge(item)}
                </div>

                {/* Precio */}
                <div className="lg:w-32 text-center">
                  <p className="text-xl font-black text-slate-900">${item.price?.toLocaleString()}</p>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">P. Unitario</span>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0">
                  <Link
                    to={`/items/${item.id}`}
                    className="flex-1 lg:flex-none px-4 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all text-center font-black text-xs uppercase"
                  >
                    Ver
                  </Link>
                  <Link
                    to={`/items/${item.id}/edit`}
                    className="flex-1 lg:flex-none px-4 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all text-center font-black text-xs uppercase"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    style={{ backgroundColor: 'white', color: '#dc2626', borderColor: '#e2e8f0' }}
                    className="flex-1 lg:flex-none px-4 py-3 rounded-xl border hover:border-red-600 hover:bg-red-50 transition-all text-center font-black text-xs uppercase"
                  >
                    Eliminar
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-200 shadow-inner">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 00-2 2H6a2 2 0 00-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em]">No se encontraron productos</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory(null); setShowLowStockOnly(false);}}
                style={{ backgroundColor: 'white', color: '#4f46e5', borderColor: '#4f46e5' }}
                className="mt-6 px-10 py-4 border-2 rounded-2xl font-black text-xs uppercase transition-all hover:bg-indigo-50"
              >
                Limpiar Filtros
              </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemsList;