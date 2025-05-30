import React, { useState, useEffect } from 'react';
// Importamos React y los hooks useState (para manejar estado local) 
// y useEffect (para ejecutar efectos al montar o actualizar el componente)

// Componente "Clientes":
// Permite listar, crear, editar y desactivar clientes usando la API REST.
// Presenta una tabla con filtros y un formulario para registrar o editar.
export default function Clientes() {
  // URL base de la API para clientes.
  // En desarrollo, CRA reenviará '/api/cliente' a 'http://localhost:3000/api/cliente'
  const API = '/api/cliente';

  // Estado local del componente:
  // - clientes: arreglo con los datos de clientes obtenidos del servidor
  // - filter: tipo de cliente a mostrar ('all' | '1' = normal | '2' = premium)
  // - form: objeto con campos para crear/editar un cliente
  // - error: mensaje de error en caso de fallo en peticiones
  const [clientes, setClientes] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [form, setForm]         = useState({ id: '', nombre: '', ciudad: '', tipo: '1' });
  const [error, setError]       = useState('');

  // Función para obtener clientes del backend según el filtro seleccionado.
  // Realiza fetch a la ruta '/api/cliente' con query string opcional '?type=1' o '?type=2'.
  const loadClients = async () => {
    try {
      setError('');
      let url = API;
      if (filter === '1' || filter === '2') url += `?type=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los clientes.');
      setClientes([]);
    }
  };

  // Hook que se ejecuta al montar el componente y cada vez que 'filter' cambie,
  // para recargar la lista de clientes.
  useEffect(() => {
    loadClients();
  }, [filter]);

  // Función que maneja el envío del formulario.
  // Decide si crea (POST) o actualiza (PUT) en base a la presencia de form.id.
  // Envía nombre, ciudad y tipo al backend.
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setError('');
      const method = form.id ? 'PUT' : 'POST';
      const url    = form.id ? `${API}/${form.id}` : API;
      const payload = {
        nombre: form.nombre,
        ciudad: form.ciudad,
        tipo:   parseInt(form.tipo, 10)
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(res.statusText);
      setForm({ id: '', nombre: '', ciudad: '', tipo: '1' });
      await loadClients();
    } catch (err) {
      console.error(err);
      setError('Error al guardar el cliente.');
    }
  };

  // Función para desactivar (eliminar) un cliente en el servidor.
  // Llama a DELETE /api/cliente/:id y recarga la lista.
  const handleDelete = async id => {
    try {
      setError('');
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(res.statusText);
      await loadClients();
    } catch (err) {
      console.error(err);
      setError('Error al desactivar el cliente.');
    }
  };

  // Renderizado de la UI:
  // - Muestra mensaje de error si existe.
  // - Select para filtrar por tipo de cliente.
  // - Tabla con datos de clientes y botones de acción.
  // - Formulario para registrar o editar un cliente.
  return (
    <div>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="mb-4 flex items-center space-x-2">
        <label>Filtro:</label>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded p-1"
        >
          <option value="all">Todos</option>
          <option value="1">Normales</option>
          <option value="2">Premium</option>
        </select>
        <button
          onClick={loadClients}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Cargar
        </button>
      </div>

      <table className="w-full table-auto mb-4">
        <thead className="bg-gray-100">
          <tr>
            {['ID','Nombre','Ciudad','Tipo','Acciones'].map(h => (
              <th key={h} className="p-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{c.ciudad}</td>
              <td className="p-2">
                {c.tipo === 1 ? 'Normal' : c.tipo === 2 ? 'Premium' : 'Inactivo'}
              </td>
              <td className="p-2 space-x-1">
                <button
                  onClick={() => setForm({ id: c.id, nombre: c.nombre, ciudad: c.ciudad, tipo: c.tipo.toString() })}
                  className="px-2 py-1 bg-yellow-400 text-white rounded"
                >✎</button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-lg font-medium mb-2">
        {form.id ? 'Editar Cliente' : 'Registrar Cliente'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <input type="hidden" value={form.id} />
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Ciudad"
          value={form.ciudad}
          onChange={e => setForm({ ...form, ciudad: e.target.value })}
          className="border rounded p-2"
          required
        />
        <select
          value={form.tipo}
          onChange={e => setForm({ ...form, tipo: e.target.value })}
          className="border rounded p-2"
          required
        >
          <option value="1">Normal</option>
          <option value="2">Premium</option>
        </select>
        <button className="bg-green-500 text-white py-2 rounded sm:col-span-4 hover:bg-green-600">
          {form.id ? 'Actualizar Cliente' : 'Registrar Cliente'}
        </button>
      </form>
    </div>
  );
}