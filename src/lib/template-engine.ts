export type ActionHandlers = Record<string, (target: HTMLElement) => void>;

export function delegate(root: HTMLElement, event: string, handlers: ActionHandlers): void {
  root.addEventListener(event, (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    e.preventDefault();
    const action = target.dataset.action ?? '';
    handlers[action]?.(target);
  });
}

export interface Component {
  init(parent: HTMLElement): void;
  _bindEvents?(): void;
  _view: NullableView;
}

export type NullableView = ViewObject | null;
export type NullableEl   = HTMLElement | null;

export interface ViewObject {
  el(selector: string): NullableEl;
  update(selector: string, value: string): void;
  on(selector: string, event: string, handler: (e: Event) => void): void;
  delegate(selector: string, event: string, handlers: ActionHandlers): void;
  node?: HTMLElement;
}

function makeView(container: HTMLElement): ViewObject {
  return {
    el:     (s) => container.querySelector<HTMLElement>(s),
    update: (s, v) => { const n = container.querySelector(s); if (n) n.textContent = v; },
    on(selector, event, handler) {
      const el = container.querySelector<HTMLElement>(selector);
      el?.addEventListener(event, (e) => { e.preventDefault(); handler(e); });
    },
    delegate(selector, event, handlers) {
      const root = container.querySelector<HTMLElement>(selector);
      if (root) delegate(root, event, handlers);
    }
  };
}

export const TemplateEngine = {
  render(container: HTMLElement, html: string): ViewObject {
    container.innerHTML = html;
    return makeView(container);
  },

  init(parent: HTMLElement, html: string, id?: string): ViewObject & { node: HTMLElement } {
    let child = id ? document.getElementById(id) as NullableEl : null;
    if (!child) {
      child = document.createElement('div');
      if (id) child.id = id;
      parent.appendChild(child);
    }
    child.innerHTML = html;
    return { ...makeView(child), node: child };
  }
};
