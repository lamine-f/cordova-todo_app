import { Store } from './store';

interface AppState {
  [key: string]: unknown;
}

class AppStoreClass extends Store<AppState> {
  constructor() { super({}); }
}

export const AppStore = new AppStoreClass();
