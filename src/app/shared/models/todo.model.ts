import { Timestamp } from '@angular/fire/firestore';

// Les 4 statuts possibles d'un todo
export type TodoStatus = 'todo' | 'in_progress' | 'done' | 'archived';

// Une sous-tâche embarquée dans le todo
export interface SubTask {
  id: string;
  title: string;
  done: boolean;
  createdAt: Timestamp;
}

// Une photo embarquée dans le todo
export interface TodoPhoto {
  id: string;
  storagePath: string; // chemin dans Firebase Storage
  url: string;         // URL publique pour affichage
  createdAt: Timestamp;
}

// Le modèle principal
export interface Todo {
  id: string;
  uid: string;              // propriétaire (utilisateur) utilisé par les règles Firestore
  title: string;
  description?: string;
  status: TodoStatus;
  deadline: Timestamp;
  categoryId: string | null;
  progress: number;         // 0-100, calculé par Cloud Function
  subTasks: SubTask[];
  photos: TodoPhoto[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Type pour la création on exclut les champs auto-générés
export type TodoCreate = Omit<Todo, 'id' | 'progress' | 'createdAt' | 'updatedAt'>;

// Type pour la mise à jour seulement les champs modifiables
export type TodoUpdate = Partial<Pick<Todo,
  'title' | 'description' | 'status' | 'deadline' |
  'categoryId' | 'subTasks' | 'photos'
>>;