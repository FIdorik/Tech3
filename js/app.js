import { validateDashboard, validateNotifications, filterRows, completion } from './data.js';

const $ = id => document.getElementById(id);
const badgeClasses = { 'Новая': 'text-bg-secondary', 'В работе': 'text-bg-warning', 'Готово': 'text-bg-success' };
let rows = [];
let notifications = [];
let selectedId = null;

async function readJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Не удалось загрузить ${path}: HTTP ${response.status}`);
  return response.json();
}

// Данные вставляются через textContent: строки JSON не интерпретируются как HTML.
function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderMetrics(metrics) {
  $('metrics').replaceChildren(...metrics.map((metric, index) => {
    const column = element('div', 'col-12 col-sm-6 col-xl-3');
    const card = element('div', 'card border-0 shadow-sm h-100');
    const body = element('div', 'card-body p-4');
    body.append(element('div', 'metric-index mb-3', `0${index + 1} / ПОКАЗАТЕЛЬ`),
      element('h2', 'h6 text-secondary', metric.title), element('p', 'metric-value mb-0', metric.value));
    card.append(body);
    column.append(card);
    return column;
  }));
}

function renderRows() {
  const visible = filterRows(rows, $('search').value, $('filter').value);
  $('operations').replaceChildren(...visible.map(row => {
    const tr = document.createElement('tr');
    const status = element('td', '');
    status.append(element('span', `badge ${badgeClasses[row.status]}`, row.status));
    const action = element('td', 'text-end');
    const button = element('button', 'btn btn-sm btn-outline-primary', 'Изменить');
    button.type = 'button';
    button.dataset.id = row.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#operation-modal';
    button.setAttribute('aria-label', `Изменить: ${row.action}`);
    action.append(button);
    tr.append(element('td', 'text-secondary', row.id), element('th', 'fw-normal', row.action), status, action);
    tr.children[1].scope = 'row';
    return tr;
  }));
  $('empty').hidden = visible.length !== 0;
  $('count').textContent = `${visible.length} из ${rows.length}`;
  const percent = completion(rows);
  $('completion').textContent = `Завершено ${rows.filter(row => row.status === 'Готово').length} из ${rows.length} · ${percent}%`;
  $('progress').setAttribute('aria-valuenow', percent);
  $('progress-bar').style.width = `${percent}%`;
}

function notify(type) {
  $('notification-text').textContent = notifications.find(item => item.type === type).text;
  $('notification').classList.toggle('text-bg-warning', type === 'warning');
  bootstrap.Toast.getOrCreateInstance($('notification')).show();
}

async function load() {
  $('loading').hidden = false;
  $('dashboard').hidden = true;
  $('error').classList.add('d-none');
  try {
    if (!window.bootstrap) throw new Error('Не загружен Bootstrap JavaScript. Проверьте доступ к CDN.');
    const [data, messages] = await Promise.all([readJson('dataset/dashboard.json'), readJson('dataset/notifications.json')]);
    validateDashboard(data);
    validateNotifications(messages);
    rows = data.rows.map(row => ({ ...row }));
    notifications = messages;
    renderMetrics(data.metrics);
    renderRows();
    $('dashboard').hidden = false;
  } catch (error) {
    $('error-text').textContent = `Не удалось открыть панель. ${error.message}. Запустите страницу через HTTP-сервер и повторите попытку.`;
    $('error').classList.remove('d-none');
  } finally {
    $('loading').hidden = true;
  }
}

$('search').addEventListener('input', renderRows);
$('filter').addEventListener('change', renderRows);
$('retry').addEventListener('click', load);
$('operation-modal').addEventListener('show.bs.modal', event => {
  selectedId = Number(event.relatedTarget?.dataset.id);
  const row = rows.find(item => item.id === selectedId);
  if (!row) { event.preventDefault(); return; }
  $('operation-name').textContent = row.action;
  $('operation-status').value = row.status;
  $('operation-form').classList.remove('was-validated');
});
$('operation-modal').addEventListener('shown.bs.modal', () => $('operation-status').focus());
$('operation-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  form.classList.add('was-validated');
  if (!form.checkValidity()) { notify('warning'); return; }
  const row = rows.find(item => item.id === selectedId);
  if (!row) return;
  row.status = $('operation-status').value;
  renderRows();
  bootstrap.Modal.getInstance($('operation-modal')).hide();
  notify('success');
});

// defer у Bootstrap и модуль приложения завершаются до DOMContentLoaded.
window.addEventListener('DOMContentLoaded', load);
