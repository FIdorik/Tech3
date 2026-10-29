export const statuses = ['Новая', 'В работе', 'Готово'];

export function validateDashboard(data) {
  if (!data || !Array.isArray(data.metrics) || !Array.isArray(data.rows) ||
      !data.metrics.every(item => item && typeof item.title === 'string' &&
        (typeof item.value === 'string' || (typeof item.value === 'number' && Number.isFinite(item.value)))) ||
      !data.rows.every(row => row && Number.isInteger(row.id) && typeof row.action === 'string' && statuses.includes(row.status)) ||
      new Set(data.rows.map(row => row.id)).size !== data.rows.length) {
    throw new Error('Некорректная структура dashboard.json');
  }
  return data;
}

export function validateNotifications(data) {
  if (!Array.isArray(data) || !['success', 'warning'].every(type =>
    data.some(item => item && item.type === type && typeof item.text === 'string' && item.text.trim()))) {
    throw new Error('Некорректная структура notifications.json');
  }
  return data;
}

export function filterRows(rows, query, status) {
  const term = query.trim().toLocaleLowerCase('ru');
  return rows.filter(row => (!status || row.status === status) && row.action.toLocaleLowerCase('ru').includes(term));
}

export function completion(rows) {
  return rows.length ? Math.round(rows.filter(row => row.status === 'Готово').length / rows.length * 100) : 0;
}
