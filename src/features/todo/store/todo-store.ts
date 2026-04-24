import { Store }       from '../../../lib/store';
import { TodoService } from '../services/todo-service';
import { Task, TodoState } from '../types/todo.types';

class TodoStoreClass extends Store<TodoState> {
  constructor() {
    super({ tasks: TodoService.load() });
  }

  add(title: string): void {
    const task = TodoService.create(title);
    const tasks = [...this._state.tasks, task];
    TodoService.save(tasks);
    this.setState({ tasks });
  }

  update(id: string, title: string): void {
    const tasks = this._state.tasks.map(t => t.id === id ? { ...t, title } : t);
    TodoService.save(tasks);
    this.setState({ tasks });
  }

  remove(id: string): void {
    const tasks = this._state.tasks.filter(t => t.id !== id);
    TodoService.save(tasks);
    this.setState({ tasks });
  }
}

export const TodoStore = new TodoStoreClass();
export type { Task };
