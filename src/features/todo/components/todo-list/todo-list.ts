import { NullableEl, NullableView, Component } from '../../../../lib/template-engine';
import { TodoStore }                           from '../../store/todo-store';
import { TodoActions }                         from '../../actions/todo-actions';
import { escape }                              from '../../../../lib/utils/html';
import { Task }                                from '../../types/todo.types';

let _container: NullableEl = null;
let _activeTab: 'active' | 'done' = 'active';

export function setTab(tab: 'active' | 'done'): void {
  _activeTab = tab;
  _refresh();
}

function _render(tasks: Task[]): string {
  const filtered = _activeTab === 'active'
    ? tasks.filter(t => !t.done)
    : tasks.filter(t =>  t.done);

  if (tasks.length === 0) {
    return `
      <div class="todo-empty-state">
        <div class="todo-empty-icon">✎</div>
        rien à faire pour l'instant.<br>ajoutez votre première tâche !
      </div>`;
  }

  if (filtered.length === 0) {
    const icon = _activeTab === 'active' ? '✓' : '✎';
    const msg  = _activeTab === 'active'
      ? 'tout est terminé !'
      : 'aucune tâche terminée pour l\'instant.';
    return `
      <div class="todo-empty-state">
        <div class="todo-empty-icon">${icon}</div>
        ${msg}
      </div>`;
  }

  return filtered.map(t => `
    <div class="todo-task${t.done ? ' todo-done-item' : ''}" data-id="${t.id}">
      <span class="todo-bullet"></span>
      <span>${escape(t.title)}</span>
    </div>`).join('');
}

function _updateCounts(tasks: Task[]): void {
  const activeCount = tasks.filter(t => !t.done).length;
  const doneCount   = tasks.filter(t =>  t.done).length;
  const elA = document.getElementById('tab-count-active');
  const elD = document.getElementById('tab-count-done');
  if (elA) elA.textContent = activeCount > 0 ? String(activeCount) : '';
  if (elD) elD.textContent = doneCount   > 0 ? String(doneCount)   : '';
}

function _refresh(): void {
  if (!_container) return;
  const tasks = TodoStore.getState().tasks;
  _container.innerHTML = _render(tasks);
  _updateCounts(tasks);
}

export const TodoList: Component = {
  _view: null as NullableView,

  init(container: HTMLElement): void {
    _container = container;
    _refresh();
    TodoStore.subscribe(() => _refresh());

    ($(_container) as any)
      .on('swipeleft',  '[data-id]', (e: any) => {
        TodoActions.remove((e.currentTarget as HTMLElement).dataset.id!);
      })
      .on('swiperight', '[data-id]', (e: any) => {
        TodoActions.toggle((e.currentTarget as HTMLElement).dataset.id!);
      });
  }
};
