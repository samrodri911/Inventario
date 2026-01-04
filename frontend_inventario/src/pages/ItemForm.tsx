import { useEffect, useState } from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { itemsService } from '../services/items.service';
import { categoriesService } from '../services/categories.service';
import type { Category } from '../types';

function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Estados del formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Estados de UI
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadItem();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadItem = async () => {
    try {
      setLoadingData(true);
      const item = await itemsService.getOne(Number(id));
      setName(item.name);
      setDescription(item.description || '');
      setSku(item.sku || '');
      setCurrentStock(item.currentStock.toString());
      setMinStock(item.minStock.toString());
      setPrice(item.price?.toString() || '');
      setCategoryId(item.categoryId?.toString() || '');
    } catch (error) {
      console.error('Error cargando item:', error);
      navigate('/items');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);

    try {
      // Construimos el objeto base sin currentStock inicialmente
      const itemData: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        sku: sku.trim() || undefined,
        minStock: minStock ? Number(minStock) : undefined,
        price: price ? Number(price) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      };

      if (isEditMode) {
        // EN EDICIÓN: No enviamos currentStock para evitar el error de la API
        await itemsService.update(Number(id), itemData);
      } else {
        // EN CREACIÓN: Aquí sí podemos definir el stock inicial
        itemData.currentStock = currentStock ? Number(currentStock) : 0;
        await itemsService.create(itemData);
      }

      navigate('/items');
    } catch (err: any) {
      console.error('Error guardando item:', err);
      setError(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-black tracking-widest text-xs uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  // Estilo para asegurar que el texto sea visible y el campo destaque
  const inputStyle = "w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all font-bold text-slate-800 placeholder-slate-400 shadow-sm";

  return (
    <div className="relative min-h-screen bg-[#f8fafc] pb-20">
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            {isEditMode ? 'Editar' : 'Nuevo'} Producto<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-xs tracking-[0.2em]">Formulario de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-10 space-y-8">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre del Producto</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">Obligatorio</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Laptop Gamer GX"
                className={inputStyle}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</span>
                <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe los detalles del producto..."
                rows={3}
                className={`${inputStyle} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SKU */}
              <div className="space-y-2">
                <label className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">SKU / Código</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="COD-001"
                  className={inputStyle}
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Categoría</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${inputStyle} appearance-none cursor-pointer`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stock Actual */}
              <div className="space-y-2">
                <label className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock Actual</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <input
                  type="number"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  className={`${inputStyle} ${isEditMode ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}`}
                  disabled={isEditMode}
                />
              </div>

              {/* Stock Mínimo */}
              <div className="space-y-2">
                <label className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Stock Mínimo</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <input
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className={inputStyle}
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <label className="flex justify-between items-center px-1">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Precio ($)</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Opcional</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Botones de acción FORZADOS PARA EVITAR EL NEGRO */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/items')}
              style={{ backgroundColor: 'white', color: '#64748b', borderColor: '#e2e8f0' }}
              className="flex-1 py-4 border-2 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#4f46e5', color: 'white', borderColor: '#4f46e5' }}
              className="flex-1 py-4 border-2 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-200 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Producto')}
            </button>
          </div>
        </form>

        {isEditMode && (
          <p className="mt-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest px-10">
            Nota: Para cambios en el stock físico actual, diríjase a la sección de Movimientos.
          </p>
        )}
      </div>
    </div>
  );
}

export default ItemForm;