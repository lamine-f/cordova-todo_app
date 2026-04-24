import { AppStore }           from '../lib/app-store';
import { LoadingScreen }      from '../components/ui/loading-screen/loading-screen';
import { LoadingScreenEvent } from '../components/ui/loading-screen/events';
import { TodoScreen }         from '../features/todo/screens/todo-screen';

interface RouteConfig {
  components: Array<{ init(parent: HTMLElement): void }>;
}

const _routes: Record<string, RouteConfig> = {
  todo: {
    components: [LoadingScreen, TodoScreen]
  }
};

const _DEFAULT_ROUTE = 'todo';

function _currentRoute(): string {
  return window.location.hash.slice(2) || _DEFAULT_ROUTE;
}

function _getOrCreatePage(route: string): HTMLElement {
  const id = `page-${route}`;
  let node = document.getElementById(id);
  if (!node) {
    node = document.createElement('div');
    node.id = id;
    node.setAttribute('data-role', 'page');
    document.body.appendChild(node);
  }
  return node;
}

function _go(route: string): void {
  const config   = _routes[route] ?? _routes[_DEFAULT_ROUTE];
  const pageNode = _getOrCreatePage(route);

  AppStore.setState({ [LoadingScreenEvent.VISIBLE]: true });
  config.components.forEach(c => c.init(pageNode));
  AppStore.setState({ [LoadingScreenEvent.VISIBLE]: false });

  ($(pageNode) as any).page();
  $(pageNode).trigger('create');

  const activePage = ($.mobile as any).activePage?.[0];
  if (activePage !== pageNode) {
    $.mobile.changePage(pageNode, {
      transition: 'slide',
      changeHash: false
    });
  }
}

export const Router = {
  init(): void {
    window.addEventListener('hashchange', () => _go(_currentRoute()));
    $(() => _go(_currentRoute()));
  }
};
