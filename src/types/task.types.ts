export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export type CreateTaskDTO = Omit<Task, 'id'>;  // для создания задачи (без id)
export type UpdateTaskDTO = Partial<CreateTaskDTO>; // для обновления (все поля опциональны)