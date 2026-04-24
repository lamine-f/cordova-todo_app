import { delegate, NullableEl, NullableView, Component } from '../../../../lib/template-engine';
import { TodoStore }             from '../../store/todo-store';
import { TodoActions }           from '../../actions/todo-actions';
import { escape }                from '../../../../lib/utils/html';
import { Task, NullableId }      from '../../types/todo.types';

let _container: NullableEl = null;
let _editingId: NullableId = null;

function _render(tasks: Task[]): string {
  if (tasks.length === 0)
    return `<li class="todo-empty">Aucune tâche pour l'instant</li>`;

  return tasks.map(t => {
    if (t.id === _editingId) return `
      <li data-id="${t.id}">
        <input class="todo-edit-input" type="text" value="${escape(t.title)}" data-id="${t.id}" />
        <a href="#" data-action="save"   data-id="${t.id}">Valider</a>
        <a href="#" data-action="cancel" data-id="${t.id}">Annuler</a>
      </li>`;
    return `
      <li data-id="${t.id}">
        <a href="#" data-action="edit"   data-id="${t.id}">${escape(t.title)}</a>
        <a href="#" data-action="delete" data-icon="delete" data-id="${t.id}">Supprimer</a>
      </li>`;
  }).join('');
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

    delegate(_container, 'click', {
      delete: (t) => TodoActions.remove(t.dataset.id!),
      edit: (t) => {
        _editingId = t.dataset.id!;
        _refresh();
        _container!.querySelector<HTMLInputElement>(`[data-id="${_editingId}"].todo-edit-input`)?.focus();
      },
      save: (t) => {
        const id = t.dataset.id!;
        const input = _container!.querySelector<HTMLInputElement>(`[data-id="${id}"].todo-edit-input`);
        if (input) TodoActions.update(id, input.value);
        _editingId = null;
      },
      cancel: () => {
        _editingId = null;
        _refresh();
      }
    });
  }
};
