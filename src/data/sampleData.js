export const monthlyData = [
  { month: 'Ene', ingresos: 3200, gastos: 2100 },
  { month: 'Feb', ingresos: 3400, gastos: 2300 },
  { month: 'Mar', ingresos: 3100, gastos: 2150 },
  { month: 'Abr', ingresos: 3600, gastos: 2500 },
  { month: 'May', ingresos: 3500, gastos: 2200 },
  { month: 'Jun', ingresos: 3800, gastos: 2400 },
];

export const categorias = [
  { nombre: 'Vivienda', monto: 850, color: '#6366f1' },
  { nombre: 'Comida', monto: 420, color: '#f59e0b' },
  { nombre: 'Transporte', monto: 280, color: '#10b981' },
  { nombre: 'Entretenimiento', monto: 150, color: '#ef4444' },
  { nombre: 'Servicios', monto: 450, color: '#3b82f6' },
  { nombre: 'Otros', monto: 500, color: '#8b5cf6' },
  { nombre: 'Náutica', monto: 0, color: '#06b6d4' },
];

export const transacciones = [
  { id: 1, descripcion: 'Salario', monto: 3800, tipo: 'ingreso', fecha: '2026-03-01', categoria: null },
  { id: 2, descripcion: 'Alquiler', monto: -850, tipo: 'gasto', fecha: '2026-03-02', categoria: 'Vivienda' },
  { id: 3, descripcion: 'Supermercado', monto: -120, tipo: 'gasto', fecha: '2026-03-03', categoria: 'Comida' },
  { id: 4, descripcion: 'Netflix', monto: -15, tipo: 'gasto', fecha: '2026-03-04', categoria: 'Entretenimiento' },
  { id: 5, descripcion: 'Freelance', monto: 500, tipo: 'ingreso', fecha: '2026-03-05', categoria: null },
  { id: 6, descripcion: 'Gasolina', monto: -60, tipo: 'gasto', fecha: '2026-03-06', categoria: 'Transporte' },
  { id: 7, descripcion: 'Restaurante', monto: -45, tipo: 'gasto', fecha: '2026-03-07', categoria: 'Comida' },
  { id: 8, descripcion: 'Electricidad', monto: -80, tipo: 'gasto', fecha: '2026-03-08', categoria: 'Servicios' },
  { id: 9, descripcion: 'Claude Code', monto: -250, tipo: 'gasto', fecha: '2026-03-10', categoria: 'Servicios' },
];
