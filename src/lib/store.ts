type Listener<T> = (state: T) => void;

export class Store<T extends object> {
  protected _state: T;
  private _listeners: Listener<T>[] = [];

  constructor(initialState: T) {
    this._state = initialState;
  }

  setState(updates: Partial<T>): void {
    Object.assign(this._state, updates);
    this._listeners.forEach(fn => fn({ ...this._state }));
  }

  subscribe(fn: Listener<T>): void {
    this._listeners.push(fn);
  }

  getState(): T {
    return { ...this._state };
  }
}
