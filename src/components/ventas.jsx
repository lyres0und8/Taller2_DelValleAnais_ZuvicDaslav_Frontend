import React, { useState, useCallback, useEffect } from "react";
// Importamos React y los hooks useState (para manejar estado local), 
// useEffect (para ejecutar efectos al montar o actualizar el componente)
// y useCallback (para optimizar funciones que dependen de estado)

// Componente "Ventas":
// Permite registrar nuevas ventas y consultar ventas existentes por cliente y fecha.
// Presenta formularios separados para registro y consulta, y una tabla para mostrar resultados.
export default function Ventas() {

  // URL base de la API para ventas.
  // En desarrollo, CRA proxy '/api/ventas' a 'http://localhost:3000/api/ventas'.
  const API = "http://localhost:3001/venta";

  // Estado local del componente:
  // - saleForm: datos del formulario para nueva venta (clienteId, items en JSON y fecha)
  // - results: array de ventas obtenidas tras consulta por cliente y fecha
  // - error: mensaje de error en caso de fallo en peticiones
  const [saleForm, setSaleForm] = useState({
    clienteId: '',
    items: '[{"id":"1","cantidad":1,"precio":0}]',
    fecha: ''
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // useEffect para ejecutar código cuando el componente se monta
  useEffect(() => {
    // Código que se ejecuta al montar el componente
    console.log('Componente Ventas montado');
    
    // Cleanup function (opcional) - se ejecuta al desmontar el componente
    return () => {
      console.log('Componente Ventas desmontado');
    };
  }, []); // Array vacío significa que solo se ejecuta una vez al montar

  // Función para registrar una nueva venta en el sistema.
  // Envía POST a /api/ventas con clienteId y array de productos (parsed del JSON).
  // Limpia el formulario tras éxito y maneja errores apropiadamente.
  const handleNewSale = useCallback(async e => {
    e.preventDefault();
    try {
      setError('');
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: saleForm.clienteId,
          productos: JSON.parse(saleForm.items)
        })
      });
      if (!res.ok) throw new Error(res.statusText);
      alert('Venta registrada con éxito');
      setSaleForm(form => ({ ...form, clienteId: '', items: '[{"id":"1","cantidad":1,"precio":0}]' }));
    } catch (err) {
      console.error(err);
      setError('Error registrando la venta.');
    }
  }, [API, saleForm.clienteId, saleForm.items]);

  // Función para consultar ventas por cliente y fecha específica.
  // Construye URL GET /api/ventas/cliente/:clienteId/fecha/:fecha y guarda el resultado en 'results'.
  // Valida que tanto cliente como fecha estén presentes antes de realizar la consulta.
  const handleQuery = useCallback(async e => {
    e.preventDefault();
    const { clienteId, fecha } = saleForm;
    if (!clienteId || !fecha) {
      setError('Completa cliente y fecha para realizar la consulta.');
      return;
    }
    try {
      setError('');
      // construye la URL con path params YYYY-MM-DD
      const url = `${API}/cliente/${clienteId}/fecha/${fecha}`;
      console.log('Fetching URL:', url);
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error('Fetch failed:', res.status, text);
        throw new Error(`${res.status}: ${text}`);
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('GET error:', err);
      setError('Error consultando las ventas.');
      setResults([]);
    }
  }, [API, saleForm]);

  // Renderizado de la UI:
  // - Muestra mensaje de error si existe.
  // - Formulario para registrar ventas con clienteId y productos en JSON.
  // - Formulario para consultar ventas por cliente y fecha.
  // - Tabla para mostrar resultados de la consulta con detalles de venta.
  return (
    <div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <h2 className="text-xl font-semibold mb-4">Registrar Venta</h2>
      <form onSubmit={handleNewSale} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <input
          type="text"
          placeholder="ID Cliente"
          value={saleForm.clienteId}
          onChange={e => setSaleForm({ ...saleForm, clienteId: e.target.value })}
          className="border rounded p-2"
          required
        />
        <textarea
          placeholder='Productos JSON: [{"id":"1","cantidad":2,"precio":1500},...]'
          value={saleForm.items}
          onChange={e => setSaleForm({ ...saleForm, items: e.target.value })}
          className="border rounded p-2"
          rows={3}
          required
        />
        <button className="sm:col-span-2 bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Registrar Venta
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Consultar Ventas</h2>
      <form onSubmit={handleQuery} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="ID Cliente"
          value={saleForm.clienteId}
          onChange={e => setSaleForm({ ...saleForm, clienteId: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          type="date"
          value={saleForm.fecha}
          onChange={e => setSaleForm({ ...saleForm, fecha: e.target.value })}
          className="border rounded p-2"
          required
        />
        <button className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Consultar Ventas
        </button>
      </form>

      {results.length > 0 && (
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Venta ID</th>
              <th className="p-2">Producto ID</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Subtotal</th>
              <th className="p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {results.map((v, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{v.ventaId}</td>
                <td className="p-2">{v.productoId}</td>
                <td className="p-2">{v.cantidad}</td>
                <td className="p-2">{v.subtotal}</td>
                <td className="p-2">{new Date(v.fecha).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
