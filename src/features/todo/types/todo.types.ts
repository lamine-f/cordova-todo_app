export type NullableId = string | null;

export interface Task {
  id:    string;
  title: string;
}

export interface TodoState {
  tasks: Task[];
}
