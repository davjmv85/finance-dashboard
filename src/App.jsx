import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiPlus } from 'react-icons/fi';
import StatCard from './components/StatCard';
import TransactionList from './components/TransactionList';
import { categorias as defaultCategorias, transacciones as initialTransacciones } from './data/sampleData';
import { getTransacciones, addTransaccion, updateTransaccion, deleteTransaccion } from './firebase';
import './App.css';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getMes(fecha) {
  return parseInt(fecha.split('-')[1], 10) - 1;
}

const CATEGORY_COLORS = {};
defaultCategorias.forEach(c => { CATEGORY_COLORS[c.nombre] = c.color; });

const emptyForm = { descripcion: '', monto: '', fecha: getToday(), tipo: 'gasto', categoria: '' };

function App() {
  const [transaccionesList, setTransaccionesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // Cargar transacciones desde Firebase al iniciar
  useEffect(() => {
    getTransacciones().then(data => {
      if (data.length === 0) {
        // Primera vez: subir datos iniciales a Firebase
        Promise.all(initialTransacciones.map(t => addTransaccion(t))).then(results => {
          setTransaccionesList(results);
          setLoading(false);
        });
      } else {
        setTransaccionesList(data);
        setLoading(false);
      }
    });
  }, []);

  const totalIngresos = useMemo(() =>
    transaccionesList.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.monto, 0),
    [transaccionesList]
  );

  const totalGastos = useMemo(() =>
    transaccionesList.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + Math.abs(t.monto), 0),
    [transaccionesList]
  );

  const balance = totalIngresos - totalGastos;
  const ahorro = totalIngresos > 0 ? ((balance / totalIngresos) * 100).toFixed(1) : '0.0';

  // Calcular datos del mes actual y anterior para trends
  const { mesActual, mesAnterior } = useMemo(() => {
    const hoy = getToday();
    const mesIdx = getMes(hoy);
    const mesAnteriorIdx = mesIdx === 0 ? 11 : mesIdx - 1;

    // Balance acumulado: suma todo hasta el cierre de cada mes
    const calcAcumulado = (hastaIdx) => {
      const trans = transaccionesList.filter(t => getMes(t.fecha) <= hastaIdx);
      const ing = trans.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
      const gas = trans.filter(t => t.tipo === 'gasto').reduce((s, t) => s + Math.abs(t.monto), 0);
      return ing - gas;
    };

    // Ingresos/gastos solo del mes
    const calcMes = (idx) => {
      const trans = transaccionesList.filter(t => getMes(t.fecha) === idx);
      const ing = trans.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0);
      const gas = trans.filter(t => t.tipo === 'gasto').reduce((s, t) => s + Math.abs(t.monto), 0);
      return { ingresos: ing, gastos: gas, ahorro: ing > 0 ? ((ing - gas) / ing) * 100 : 0 };
    };

    const actual = calcMes(mesIdx);
    const anterior = calcMes(mesAnteriorIdx);
    actual.balanceAcum = calcAcumulado(mesIdx);
    anterior.balanceAcum = calcAcumulado(mesAnteriorIdx);

    return { mesActual: actual, mesAnterior: anterior };
  }, [transaccionesList]);

  function calcTrend(actual, anterior) {
    if (anterior === 0) return actual > 0 ? '+100%' : '0%';
    const pct = ((actual - anterior) / Math.abs(anterior)) * 100;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  }

  const trendBalance = calcTrend(mesActual.balanceAcum, mesAnterior.balanceAcum);
  const trendIngresos = calcTrend(mesActual.ingresos, mesAnterior.ingresos);
  const trendGastos = calcTrend(mesActual.gastos, mesAnterior.gastos);
  const trendAhorro = calcTrend(mesActual.ahorro, mesAnterior.ahorro);

  const monthlyData = useMemo(() => {
    const byMonth = {};
    transaccionesList.forEach(t => {
      const mes = MESES[getMes(t.fecha)];
      if (!byMonth[mes]) byMonth[mes] = { month: mes, ingresos: 0, gastos: 0 };
      if (t.tipo === 'ingreso') {
        byMonth[mes].ingresos += t.monto;
      } else {
        byMonth[mes].gastos += Math.abs(t.monto);
      }
    });
    return MESES.filter(m => byMonth[m]).map(m => ({
      ...byMonth[m],
      ahorro: byMonth[m].ingresos - byMonth[m].gastos,
    }));
  }, [transaccionesList]);

  const categoriasList = useMemo(() => {
    const byCategoria = {};
    transaccionesList.filter(t => t.tipo === 'gasto' && t.categoria).forEach(t => {
      if (!byCategoria[t.categoria]) {
        byCategoria[t.categoria] = {
          nombre: t.categoria,
          monto: 0,
          color: CATEGORY_COLORS[t.categoria] || '#888',
        };
      }
      byCategoria[t.categoria].monto += Math.abs(t.monto);
    });
    return Object.values(byCategoria).filter(c => c.monto > 0);
  }, [transaccionesList]);

  const categoriasOptions = defaultCategorias.map(c => c.nombre);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const openNewForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (t) => {
    setEditingId(t.firebaseId);
    setFormData({
      descripcion: t.descripcion,
      monto: String(Math.abs(t.monto)),
      fecha: t.fecha,
      tipo: t.tipo,
      categoria: t.categoria || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monto = parseFloat(formData.monto);
    if (!formData.descripcion || isNaN(monto) || monto <= 0) return;
    if (formData.tipo === 'gasto' && !formData.categoria) return;

    const isIngreso = formData.tipo === 'ingreso';

    const transaccionData = {
      descripcion: formData.descripcion,
      monto: isIngreso ? monto : -monto,
      tipo: formData.tipo,
      fecha: formData.fecha,
      categoria: isIngreso ? null : formData.categoria,
    };

    if (editingId) {
      await updateTransaccion(editingId, transaccionData);
      setTransaccionesList(prev => prev.map(t => t.firebaseId === editingId
        ? { ...t, ...transaccionData }
        : t
      ));
    } else {
      const nueva = await addTransaccion(transaccionData);
      setTransaccionesList(prev => [...prev, nueva]);
    }

    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (t) => {
    await deleteTransaccion(t.firebaseId);
    setTransaccionesList(prev => prev.filter(tr => tr.firebaseId !== t.firebaseId));
  };

  const formTitle = editingId
    ? `Editar ${formData.tipo}`
    : 'Nueva transacción';

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#888', fontSize: '1.2rem' }}>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Dashboard Financiero</h1>
        <div className="header-right">
          <button className="btn-add" onClick={openNewForm}>
            <FiPlus /> Nueva transacción
          </button>
          <span className="header-date">Marzo 2026</span>
        </div>
      </header>

      {showForm && (
        <div className="form-overlay" onClick={closeForm}>
          <form className="expense-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>{formTitle}</h3>
            <label>
              Tipo
              <div className="tipo-toggle">
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipo === 'gasto' ? 'active-gasto' : ''}`}
                  onClick={() => setFormData({ ...formData, tipo: 'gasto' })}
                >
                  Gasto
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipo === 'ingreso' ? 'active-ingreso' : ''}`}
                  onClick={() => setFormData({ ...formData, tipo: 'ingreso', categoria: '' })}
                >
                  Ingreso
                </button>
              </div>
            </label>
            <label>
              Fecha
              <input
                type="date"
                value={formData.fecha}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
              />
            </label>
            <label>
              Concepto
              <input
                type="text"
                placeholder={formData.tipo === 'ingreso' ? 'Ej: Salario' : 'Ej: Claude Code'}
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </label>
            {formData.tipo === 'gasto' && (
              <label>
                Categoría
                <select
                  value={formData.categoria}
                  onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="">Seleccionar categoría</option>
                  {categoriasOptions.map(nombre => (
                    <option key={nombre} value={nombre}>{nombre}</option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Monto ($)
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.monto}
                onChange={e => setFormData({ ...formData, monto: e.target.value })}
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={closeForm}>Cancelar</button>
              <button type="submit" className="btn-submit">{editingId ? 'Guardar' : 'Agregar'}</button>
            </div>
          </form>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          title="Balance"
          value={`${balance.toLocaleString('es-AR')} $`}
          icon={<FiDollarSign />}
          trend={`${trendBalance} vs mes anterior`}
          trendPositive={mesActual.balanceAcum >= mesAnterior.balanceAcum}
        />
        <StatCard
          title="Ingresos del mes"
          value={`${mesActual.ingresos.toLocaleString('es-AR')} $`}
          icon={<FiTrendingUp />}
          trend={`${trendIngresos} vs mes anterior`}
          trendPositive={mesActual.ingresos >= mesAnterior.ingresos}
        />
        <StatCard
          title="Gastos del mes"
          value={`${mesActual.gastos.toLocaleString('es-AR')} $`}
          icon={<FiTrendingDown />}
          trend={`${trendGastos} vs mes anterior`}
          trendPositive={mesActual.gastos <= mesAnterior.gastos}
        />
        <StatCard
          title="Ahorro del mes"
          value={`${mesActual.ahorro.toFixed(1)}%`}
          icon={<FiPieChart />}
          trend={`${trendAhorro} vs mes anterior`}
          trendPositive={mesActual.ahorro >= mesAnterior.ahorro}
        />
      </section>

      <section className="charts-grid">
        <div className="chart-card">
          <h3>Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ background: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                itemSorter={() => 0}
              />
              <Legend content={() => (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
                  {[
                    { label: 'ingresos', color: '#10b981' },
                    { label: 'gastos', color: '#ef4444' },
                    { label: 'ahorro', color: '#f59e0b' },
                  ].map(item => (
                    <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ccc' }}>
                      <span style={{ width: 12, height: 12, borderRadius: 2, background: item.color, display: 'inline-block' }} />
                      {item.label}
                    </span>
                  ))}
                </div>
              )} />
              <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ahorro" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Gastos por categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriasList}
                dataKey="monto"
                nameKey="nombre"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
              >
                {categoriasList.map((cat, i) => (
                  <Cell key={i} fill={cat.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bottom-section">
        <TransactionList
          transacciones={transaccionesList}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}

export default App;
