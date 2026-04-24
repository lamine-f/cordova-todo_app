import { AppStore }           from '../../../lib/app-store';
import { TemplateEngine }     from '../../../lib/template-engine';
import { LoadingScreenEvent } from './events';

export const LoadingScreen = {
  init(parent: HTMLElement): void {
    const view = TemplateEngine.init(parent, this._template(), 'loading-root');

    AppStore.subscribe((state) => {
      const el = view.el('div');
      if (el) el.style.display = state[LoadingScreenEvent.VISIBLE] ? 'flex' : 'none';
    });
  },

  _template(): string {
    return `
      <div style="display:none; align-items:center; justify-content:center;
                  position:fixed; inset:0; background:var(--color-bg);
                  font-size:1.2rem; color:var(--color-primary); z-index:100;">
        Chargement...
      </div>
    `;
  }
};
