export type NullableId = string | null;

export interface Task {
  id:    string;
  title: string;
  done:  boolean;
}

export interface TodoState {
  tasks: Task[];
}
