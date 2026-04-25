import { TemplateEngine, NullableView, Component } from '../../../lib/template-engine';
import { TodoActions }                             from '../actions/todo-actions';
import { TodoList, setTab }                        from '../components/todo-list/todo-list';

type Tab = 'active' | 'done';

function _template(): string {
  return `
    <div data-role="header">
      <h1 class="todo-page-title">Mes tâches</h1>
    </div>
    <div data-role="content" class="todo-page-content">
      <div class="todo-input-row">
        <input type="text" id="todo-input" class="todo-input-box" placeholder="quoi faire ?" />
        <button type="button" id="btn-add" class="todo-btn todo-btn-add">Ajouter</button>
      </div>

      <div class="todo-tabs">
        <button class="todo-tab active" data-tab="active">
          En cours <span class="tab-count" id="tab-count-active"></span>
        </button>
        <button class="todo-tab" data-tab="done">
          Terminées <span class="tab-count" id="tab-count-done"></span>
        </button>
      </div>

      <div id="todo-list" class="todo-task-list"></div>

      <div class="btn-row">
        <button type="button" id="btn-reset" class="todo-btn todo-btn-reset">⟲ Tout réinitialiser</button>
      </div>

      <div id="reset-modal" class="todo-modal hidden">
        <div class="todo-modal-box">
          <h3>Tout effacer ?</h3>
          <p>Cela supprimera toutes les tâches et masquera les compartiments.</p>
          <div class="todo-modal-actions">
            <button id="btn-reset-cancel" class="btn-cancel">annuler</button>
            <button id="btn-reset-confirm" class="btn-confirm">oui, effacer</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export const TodoScreen: Component = {
  _view: null as NullableView,

  init(parent: HTMLElement): void {
    this._view = TemplateEngine.init(parent, _template(), 'screen-root');
    TodoList.init(this._view!.el('#todo-list')!);
    this._bindEvents?.();
  },

  _bindEvents(): void {
    const view = this._view!;

    const _add = () => {
      const input = view.el('#todo-input') as HTMLInputElement;
      TodoActions.add(input.value);
      input.value = '';
    };

    view.on('#btn-add', 'click', _add);
    view.on('#todo-input', 'keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') _add();
    });

    view.el('.todo-tabs')!
      .querySelectorAll<HTMLElement>('.todo-tab')
      .forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const tab = btn.dataset.tab as Tab;
          view.el('.todo-tabs')!
            .querySelectorAll('.todo-tab')
            .forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          setTab(tab);
        });
      });

    view.on('#btn-reset', 'click', () => {
      view.el('#reset-modal')!.classList.remove('hidden');
    });

    view.on('#btn-reset-cancel', 'click', () => {
      view.el('#reset-modal')!.classList.add('hidden');
    });

    view.on('#btn-reset-confirm', 'click', () => {
      TodoActions.clear();
      view.el('#reset-modal')!.classList.add('hidden');
    });
  }
};
