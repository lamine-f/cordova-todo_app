import { TemplateEngine, ViewObject } from '../../../lib/template-engine';
import { TodoStore }                   from '../store/todo-store';
import { TodoActions }                 from '../actions/todo-actions';
import { Task }                        from '../types/todo.types';

let _view:      ViewObject | null = null;
let _editingId: string    | null = null;

function _escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string));
}

function _renderList(tasks: Task[]): string {
  if (tasks.length === 0) {
    return `<li class="todo-empty">Aucune tâche pour l'instant</li>`;
  }
  return tasks.map(t => {
    if (t.id === _editingId) {
      return `
        <li data-id="${t.id}">
          <input class="todo-edit-input" type="text" value="${_escape(t.title)}" data-id="${t.id}" />
          <a href="#" class="todo-edit-save" data-id="${t.id}">Valider</a>
          <a href="#" class="todo-edit-cancel" data-id="${t.id}">Annuler</a>
        </li>
      `;
    }
    return `
      <li data-id="${t.id}">
        <a href="#" class="todo-item" data-id="${t.id}">${_escape(t.title)}</a>
        <a href="#" class="todo-delete" data-icon="delete" data-id="${t.id}">Supprimer</a>
      </li>
    `;
  }).join('');
}

function _refreshList(): void {
  const listEl = _view!.el('#todo-list');
  if (!listEl) return;
  listEl.innerHTML = _renderList(TodoStore.getState().tasks);
  const $list = $(listEl) as any;
  if ($list.data('mobile-listview')) $list.listview('refresh');
}

export const TodoScreen = {
  init(parent: HTMLElement): void {
    _view = TemplateEngine.init(parent, this._template(), 'screen-root');

    TodoStore.subscribe(() => _refreshList());

    this._bindEvents();
  },

  _template(): string {
    const tasks = TodoStore.getState().tasks;
    return `
      <div data-role="header" data-theme="b">
        <h1>Todo App</h1>
      </div>
      <div data-role="content">
        <form class="todo-form">
          <div data-role="fieldcontain">
            <label for="todo-input">Nouvelle tâche :</label>
            <input type="text" id="todo-input" placeholder="Ex: Faire les courses" />
          </div>
          <button type="submit" data-role="button" data-theme="b">Ajouter</button>
        </form>
        <ul id="todo-list" data-role="listview" data-inset="true">
          ${_renderList(tasks)}
        </ul>
      </div>
    `;
  },

  _bindEvents(): void {
    const form = _view!.el('.todo-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = _view!.el('#todo-input') as HTMLInputElement;
      TodoActions.add(input.value);
      input.value = '';
    });

    const listEl = _view!.el('#todo-list');
    listEl?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      e.preventDefault();

      const id = target.getAttribute('data-id');
      if (!id) return;

      if (target.classList.contains('todo-delete')) {
        TodoActions.remove(id);
      } else if (target.classList.contains('todo-item')) {
        _editingId = id;
        _refreshList();
        const input = listEl.querySelector<HTMLInputElement>(`.todo-edit-input[data-id="${id}"]`);
        input?.focus();
      } else if (target.classList.contains('todo-edit-save')) {
        const input = listEl.querySelector<HTMLInputElement>(`.todo-edit-input[data-id="${id}"]`);
        if (input) TodoActions.update(id, input.value);
        _editingId = null;
      } else if (target.classList.contains('todo-edit-cancel')) {
        _editingId = null;
        _refreshList();
      }
    });
  }
};
