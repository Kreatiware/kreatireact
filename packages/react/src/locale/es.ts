import type { KreatiLocale } from './types';

export const es: KreatiLocale = {
  select: {
    filterPlaceholder: 'Buscar...',
    emptyMessage: 'Sin resultados',
    clearLabel: 'Limpiar seleccion',
  },
  multiSelect: {
    filterPlaceholder: 'Buscar...',
    emptyMessage: 'Sin resultados',
    clearLabel: 'Limpiar todo',
    selectAll: 'Seleccionar todo',
    selectedCount: '{count} seleccionados',
  },
  calendar: {
    previousMonth: 'Mes anterior',
    nextMonth: 'Mes siguiente',
    previousYear: 'Anio anterior',
    nextYear: 'Anio siguiente',
    calendarLabel: 'Calendario',
    today: 'Hoy',
    clear: 'Limpiar',
    hour: 'Horas',
    hourShort: 'Hrs',
    minute: 'Minutos',
    minuteShort: 'Min',
    second: 'Segundos',
    secondShort: 'Seg',
    presetToday: 'Hoy',
    presetYesterday: 'Ayer',
    presetLast7Days: 'Ultimos 7 dias',
    presetLast14Days: 'Ultimos 14 dias',
    presetLast30Days: 'Ultimos 30 dias',
    presetThisWeek: 'Esta semana',
    presetThisMonth: 'Este mes',
    presetLastMonth: 'Mes anterior',
    presetThisYear: 'Este anio',
  },
  common: {
    loading: 'Cargando...',
    close: 'Cerrar',
    search: 'Buscar',
  },
  slider: {
    rangeMin: 'minimo',
    rangeMax: 'maximo',
  },
};
