import { TemplateEngine, ViewObject } from '../../../lib/template-engine';
import { TodoStore }                   from '../store/todo-store';
import { Task }                        from '../types/todo.types';

let _view: ViewObject | null = null;

function _renderList(tasks: Task[]): string {
  if (tasks.length === 0) {
    return `<li class="todo-empty">Aucune tâche pour l'instant</li>`;
  }
  return tasks.map(t => `
    <li data-id="${t.id}">
      <a href="#" class="todo-item">${_escape(t.title)}</a>
      <a href="#" class="todo-delete" data-icon="delete" data-id="${t.id}">Supprimer</a>
    </li>
  `).join('');
}

function _escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c] as string));
}

export const TodoScreen = {
  init(parent: HTMLElement): void {
    _view = TemplateEngine.init(parent, this._template(), 'screen-root');

    TodoStore.subscribe((state) => {
      const listEl = _view!.el('#todo-list');
      if (!listEl) return;
      listEl.innerHTML = _renderList(state.tasks);
      const $list = $(listEl) as any;
      if ($list.data('mobile-listview')) {
        $list.listview('refresh');
      }
    });

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
      const title = input.value.trim();
      if (!title) return;
      TodoStore.add(title);
      input.value = '';
    });

    const listEl = _view!.el('#todo-list');
    listEl?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      e.preventDefault();
      if (target.classList.contains('todo-delete')) {
        const id = target.getAttribute('data-id');
        if (id) TodoStore.remove(id);
      }
    });
  }
};
