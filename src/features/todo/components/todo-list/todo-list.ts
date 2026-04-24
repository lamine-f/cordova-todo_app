import { NullableEl, NullableView, Component } from '../../../../lib/template-engine';
import { TodoStore }                           from '../../store/todo-store';
import { TodoActions }                         from '../../actions/todo-actions';
import { escape }                              from '../../../../lib/utils/html';
import { Task }                                from '../../types/todo.types';

let _container: NullableEl = null;

function _render(tasks: Task[]): string {
  if (tasks.length === 0)
    return `<li class="todo-empty">Aucune tâche pour l'instant</li>`;

  const active = tasks.filter(t => !t.done);
  const done   = tasks.filter(t =>  t.done);
  let html = '';

  if (active.length > 0) {
    html += `<li data-role="list-divider">En cours</li>`;
    html += active.map(t => `
      <li data-id="${t.id}" data-done="false">
        <a href="#">${escape(t.title)}</a>
      </li>`).join('');
  }

  if (done.length > 0) {
    html += `<li data-role="list-divider">Terminées</li>`;
    html += done.map(t => `
      <li data-id="${t.id}" data-done="true" class="todo-done">
        <a href="#" class="todo-done-link">${escape(t.title)}</a>
      </li>`).join('');
  }

  return html;
}

function _refresh(): void {
  if (!_container) return;
  _container.innerHTML = _render(TodoStore.getState().tasks);
  const $list = $(_container) as any;
  if ($list.data('mobile-listview')) $list.listview('refresh');
}

export const TodoList: Component = {
  _view: null as NullableView,

  init(container: HTMLElement): void {
    _container = container;
    _refresh();
    TodoStore.subscribe(() => _refresh());

    ($(_container) as any)
      .on('swipeleft',  'li[data-id]', (e: any) => {
        TodoActions.remove((e.currentTarget as HTMLElement).dataset.id!);
      })
      .on('swiperight', 'li[data-id]', (e: any) => {
        TodoActions.toggle((e.currentTarget as HTMLElement).dataset.id!);
      });
  }
};
