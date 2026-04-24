import { AppStore }                          from '../../../lib/app-store';
import { TemplateEngine, NullableView, Component } from '../../../lib/template-engine';
import { LoadingScreenEvent }               from './events';

function _template(): string {
  return `
    <div style="display:none; align-items:center; justify-content:center;
                position:fixed; inset:0; background:var(--color-bg);
                font-size:1.2rem; color:var(--color-primary); z-index:100;">
      Chargement...
    </div>
  `;
}

export const LoadingScreen: Component = {
  _view: null as NullableView,

  init(parent: HTMLElement): void {
    this._view = TemplateEngine.init(parent, _template(), 'loading-root');
    AppStore.subscribe((state) => {
      const el = this._view!.el('div');
      if (el) el.style.display = state[LoadingScreenEvent.VISIBLE] ? 'flex' : 'none';
    });
  }
};
