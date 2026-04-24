import { TodoStore } from '../store/todo-store';

export const TodoActions = {
  add(title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;
    TodoStore.add(trimmed);
  },

  update(id: string, title: string): void {
    const trimmed = title.trim();
    if (!trimmed) return;
    TodoStore.update(id, trimmed);
  },

  toggle(id: string): void {
    TodoStore.toggle(id);
  },

  remove(id: string): void {
    TodoStore.remove(id);
  },

  clear(): void {
    TodoStore.clear();
  }
};
