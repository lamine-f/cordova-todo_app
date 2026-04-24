import { Storage } from '../../../lib/utils/storage';
import { Task }    from '../types/todo.types';

const _KEY = 'todo.tasks';

export const TodoService = {
  load(): Task[] {
    const raw = Storage.get(_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as Task[];
      return Array.isArray(parsed)
        ? parsed.map(t => ({ ...t, done: (t as any).done ?? false }))
        : [];
    } catch {
      return [];
    }
  },

  save(tasks: Task[]): void {
    Storage.set(_KEY, JSON.stringify(tasks));
  },

  create(title: string): Task {
    return { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), title, done: false };
  }
};
