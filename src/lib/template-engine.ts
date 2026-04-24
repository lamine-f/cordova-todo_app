export interface ViewObject {
  el(selector: string): HTMLElement | null;
  update(selector: string, value: string): void;
  node?: HTMLElement;
}

function makeView(container: HTMLElement): ViewObject {
  return {
    el:     (s) => container.querySelector<HTMLElement>(s),
    update: (s, v) => { const n = container.querySelector(s); if (n) n.textContent = v; }
  };
}

export const TemplateEngine = {
  render(container: HTMLElement, html: string): ViewObject {
    container.innerHTML = html;
    return makeView(container);
  },

  init(parent: HTMLElement, html: string, id?: string): ViewObject & { node: HTMLElement } {
    let child = id ? document.getElementById(id) as HTMLElement | null : null;
    if (!child) {
      child = document.createElement('div');
      if (id) child.id = id;
      parent.appendChild(child);
    }
    child.innerHTML = html;
    return { ...makeView(child), node: child };
  }
};
