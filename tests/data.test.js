import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDashboard, validateNotifications, filterRows, completion } from '../js/data.js';
const data = JSON.parse(await readFile(new URL('../dataset/dashboard.json', import.meta.url), 'utf8'));
const messages = JSON.parse(await readFile(new URL('../dataset/notifications.json', import.meta.url), 'utf8'));

test('исходный датасет соответствует контракту', () => {
  assert.equal(validateDashboard(data), data);
  assert.equal(validateNotifications(messages), messages);
  assert.equal(data.metrics.length, 4);
  assert.equal(data.rows.length, 8);
});
test('поиск учитывает регистр, пробелы и выбранный статус', () => {
  assert.deepEqual(filterRows(data.rows, '  ОПЕРАЦИЯ 2 ', 'Готово').map(row => row.id), [2]);
  assert.equal(filterRows(data.rows, 'Операция 2', 'Новая').length, 0);
  assert.equal(filterRows(data.rows, '', '').length, 8);
  assert.equal(filterRows(data.rows, 'нет такой операции', '').length, 0);
});
test('доля завершённых операций изменяется после обновления и допускает пустую таблицу', () => {
  const rows = data.rows.map(row => ({ ...row }));
  assert.equal(completion(rows), 38);
  rows[0].status = 'Готово';
  assert.equal(completion(rows), 50);
  assert.equal(completion([]), 0);
  assert.equal(data.rows[0].status, 'В работе');
});
test('неверная структура, дубликаты и неизвестные статусы отклоняются', () => {
  assert.throws(() => validateDashboard(null));
  assert.throws(() => validateDashboard({ metrics: [], rows: [data.rows[0], data.rows[0]] }));
  assert.throws(() => validateDashboard({ metrics: [], rows: [{ id: 1, action: 'x', status: '???' }] }));
  assert.throws(() => validateNotifications([]));
  assert.throws(() => validateNotifications([{ type: 'success', text: '' }]));
});
