
import React, { useState } from 'react';
// Importamos React y el hook useState para manejar el estado local del componente


// Componente "Ventas":
// Permite registrar nuevas ventas y consultar ventas existentes por cliente y fecha.
export default function Ventas() {

  // URL base de la API para ventas.
  // Con Create React App en desarrollo, '/api/ventas' se proxy a 'http://localhost:3000/api/ventas'.
  const API = '/api/ventas';

  // Estado local:
  // - saleForm: datos del formulario para nueva venta (clienteId, items en JSON y fecha)
  // - results: array de ventas obtenidas tras consulta
  const [saleForm, setSaleForm] = useState({
    clienteId: '',
    items: '[{"id":"1","cantidad":1,"precio":0}]',
    fecha: ''
  });
  const [results, setResults] = useState([]);

  // 7. Función para registrar una nueva venta
  // Envía POST a /api/ventas con clienteId y array de productos (parsed del JSON)
  const handleNewSale = async e => {
    e.preventDefault();
    try {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: saleForm.clienteId,
          productos: JSON.parse(saleForm.items)
        })
      });
      alert('Venta registrada con éxito');
      setSaleForm(form => ({ ...form, clienteId: '', items: '[]' }));
    } catch (err) {
      console.error(err);
      alert('Error registrando la venta');
    }
  };

  // 8. Función para consultar ventas por cliente y fecha
  // Construye URL GET /api/ventas/cliente/:clienteId/fecha/:fecha y guarda el resultado en 'results'
  const handleQuery = async e => {
    e.preventDefault();
    const { clienteId, fecha } = saleForm;
    if (!clienteId || !fecha) {
      return alert('Completa cliente y fecha');
    }
    // construye la URL con path params YYYY-MM-DD
    const url = `${API}/cliente/${clienteId}/fecha/${fecha}`;
    console.log('Fetching URL:', url);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error('Fetch failed:', res.status, text);
        return alert(`Error ${res.status}: ${text}`);
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('GET error:', err);
      alert('Error consultando las ventas');
    }
  };

  // Renderizado de la interfaz:
  // - Formulario para registrar ventas
  // - Formulario para consultar ventas por cliente y fecha
  // - Tabla para mostrar resultados de la consulta
  return (
    <div>
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
