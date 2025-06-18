import React, { useState, useEffect, useCallback } from 'react';
// Importamos React y los hooks useState (para manejar estado local) 
// useEffect (para ejecutar efectos al montar o actualizar el componente)
// y useCallback (para optimizar funciones que dependen de estado)

// Componente "Productos":
// Permite listar, crear, editar, deshabilitar productos y ver estadísticas de ventas recientes y anuales.
// Presenta una interfaz completa con filtros, estadísticas y formularios para gestión de productos.
export default function Productos() {
  // URL base de la API para productos.
  // En desarrollo, CRA reenviará '/api/producto' a 'http://localhost:3000/api/producto'
  const API = "http://localhost:3001/producto";

  // Estado local del componente:
  // - productos: lista de productos disponibles
  // - recentSold: lista de productos vendidos en la última semana
  // - yearCount: total vendido en el año actual
  // - form: datos del formulario para crear/editar producto
  // - error: mensaje de error para mostrar al usuario
  const [productos, setProductos]   = useState([]);
  const [recentSold, setRecentSold] = useState([]);
  const [yearCount, setYearCount]   = useState(null);
  const [form, setForm]             = useState({ id: '', name: '', price: '', stock: '' });
  const [error, setError]           = useState('');

  // Función para cargar productos disponibles desde el backend.
  // Realiza fetch a la ruta '/api/producto?disponible=true' para obtener solo productos activos.
  const loadAvailable = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`${API}?disponible=true`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar productos disponibles.');
      setProductos([]);
    }
  }, [API]);

  // Función para cargar productos vendidos recientemente en la semana.
  // Realiza fetch a la ruta '/api/producto/sold/estaSemana' para obtener estadísticas de ventas.
  const loadRecentSold = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`${API}/sold/estaSemana`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setRecentSold(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar productos vendidos esta semana.');
      setRecentSold([]);
    }
  }, [API]);

  // Función para obtener la cantidad de productos vendidos en el año actual.
  // Realiza fetch a la ruta '/api/producto/vendidos/añoActual' para obtener estadísticas anuales.
  const loadYearCount = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`${API}/vendidos/añoActual`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { count } = await res.json();
      setYearCount(count);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar conteo de ventas anual.');
      setYearCount(null);
    }
  }, [API]);

  // Hook que se ejecuta al montar el componente para cargar la lista de productos disponibles.
  // Se ejecuta una vez al montar y cada vez que loadAvailable cambie.
  useEffect(() => {
    loadAvailable();
  }, [loadAvailable]);

  // Función que maneja el envío del formulario.
  // Decide si crea (POST) o actualiza (PUT) en base a la presencia de form.id.
  // Envía name, price y stock al backend.
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setError('');
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `${API}/${form.id}` : API;
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10)
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setForm({ id: '', name: '', price: '', stock: '' });
      await loadAvailable();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el producto.');
    }
  };

  // Función para deshabilitar (eliminar) un producto en el servidor.
  // Llama a DELETE /api/producto/:id y recarga la lista.
  const handleDelete = async id => {
    try {
      setError('');
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      await loadAvailable();
    } catch (err) {
      console.error(err);
      setError('Error al deshabilitar el producto.');
    }
  };

  // Función para actualizar el precio de un producto.
  // Solicita nuevo precio al usuario y actualiza mediante PUT /api/producto/:id.
  const handleUpdatePrice = async id => {
    const p = prompt('Nuevo precio:');
    if (!p) return;
    try {
      setError('');
      const res = await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(p) })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      await loadAvailable();
    } catch (err) {
      console.error(err);
      setError('Error al actualizar precio.');
    }
  };

  // Función para incrementar el stock de un producto.
  // Solicita cantidad al usuario y actualiza mediante PUT /api/producto/:id/stock.
  const handleIncStock = async id => {
    const s = prompt('Incrementar stock en:');
    if (!s) return;
    try {
      setError('');
      const res = await fetch(`${API}/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(s, 10) })
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      await loadAvailable();
    } catch (err) {
      console.error(err);
      setError('Error al incrementar stock.');
    }
  };

  // Renderizado de la UI:
  // - Muestra mensaje de error si existe.
  // - Botones para filtrar acciones (disponibles, vendidos esta semana, total anual).
  // - Tabla de productos con datos y botones de acción.
  // - Sección de ventas recientes y conteo anual.
  // - Formulario para registrar o editar productos.
  return (
    <div>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="mb-4 space-x-2">
        <button onClick={loadAvailable}  className="bg-blue-500 text-white px-3 py-1 rounded">
          Disponibles
        </button>
        <button onClick={loadRecentSold} className="bg-indigo-500 text-white px-3 py-1 rounded">
          Vendidos esta semana
        </button>
        <button onClick={loadYearCount}  className="bg-teal-500 text-white px-3 py-1 rounded">
          Total año actual
        </button>
      </div>

      {/* Lista de productos disponibles */}
      <table className="w-full table-auto mb-4">
        <thead className="bg-gray-100">
          <tr>
            {['ID', 'Nombre', 'Precio', 'Stock', 'Acciones'].map(h => (
              <th key={h} className="p-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.productoID} className="border-t">
              <td className="p-2">{p.productoID}</td>
              <td className="p-2">{p.nombre}</td>
              <td className="p-2">{p.precio}</td>
              <td className="p-2">{p.stock}</td>
              <td className="p-2 space-x-1">
                <button onClick={() => handleUpdatePrice(p.productoID)} className="px-2 py-1 bg-yellow-400 text-white rounded">
                  💲
                </button>
                <button onClick={() => handleIncStock(p.productoID)} className="px-2 py-1 bg-green-500 text-white rounded">
                  ➕
                </button>
                <button onClick={() => handleDelete(p.productoID)} className="px-2 py-1 bg-red-500 text-white rounded">
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ventas recientes esta semana */}
      {recentSold.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">Vendidos Esta Semana</h3>
          <ul className="mb-4 list-disc list-inside">
            {recentSold.map(item => (
              <li key={item.productId}>
                {item.productName}: {item.quantitySold} unidades
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Conteo anual */}
      {yearCount !== null && (
        <p className="mb-4">
          <strong>Total vendidos este año:</strong> {yearCount} unidades
        </p>
      )}

      {/* Formulario crear/editar producto */}
      <h3 className="text-lg font-medium mb-2">
        {form.id ? 'Editar Producto' : 'Registrar Producto'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <input type="hidden" value={form.id} />
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          placeholder="Precio"
          type="number"
          step="0.01"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
          className="border rounded p-2"
          required
        />
        <button className="bg-green-500 text-white py-2 rounded sm:col-span-4 hover:bg-green-600">
          {form.id ? 'Actualizar Producto' : 'Registrar Producto'}
        </button>
      </form>
    </div>
  );
}
