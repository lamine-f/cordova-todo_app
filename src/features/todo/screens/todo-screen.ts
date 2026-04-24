import { TemplateEngine, NullableView, Component } from '../../../lib/template-engine';
import { TodoActions }                             from '../actions/todo-actions';
import { TodoList }                                from '../components/todo-list/todo-list';

function _template(): string {
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
      <button type="button" id="btn-reset" data-role="button" data-theme="a">Réinitialiser</button>
      <ul id="todo-list" data-role="listview" data-inset="true"></ul>
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
    this._view!.on('.todo-form', 'submit', () => {
      const input = this._view!.el('#todo-input') as HTMLInputElement;
      TodoActions.add(input.value);
      input.value = '';
    });

    this._view!.on('#btn-reset', 'click', () => TodoActions.clear());
  }
};
