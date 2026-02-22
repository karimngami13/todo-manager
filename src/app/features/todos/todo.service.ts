import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData,doc, docData, addDoc,
  updateDoc, deleteDoc, serverTimestamp, query, where, orderBy,
  arrayUnion, arrayRemove
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Todo, TodoCreate, TodoUpdate, SubTask, TodoPhoto } from '../../shared/models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  // Référence à la collection todos
  private get todosRef() {
    return collection(this.firestore, 'todos');
  }

  // Récupère tous les todos de l'utilisateur connecté, triés par deadline
  getTodos(): Observable<Todo[]> {
    const q = query(
      this.todosRef,
      where('uid', '==', this.auth.uid()!),
      orderBy('deadline', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Todo[]>;
  }

  // Récupère un todo par son ID
  getTodoById(id: string): Observable<Todo> {
    return docData(
      doc(this.firestore, 'todos', id),
      { idField: 'id' }
    ) as Observable<Todo>;
  }

  // CREATE

  async createTodo(data: Omit<TodoCreate, 'uid'>): Promise<string> {
    const ref = await addDoc(this.todosRef, {
      ...data,
      uid: this.auth.uid(),
      progress: 0,
      subTasks: [],
      photos: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  // UPDATE

  async updateTodo(id: string, data: TodoUpdate): Promise<void> {
    await updateDoc(doc(this.firestore, 'todos', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  // DELETE

  // La Cloud Function onDelete nettoiera automatiquement les photos Storage
  async deleteTodo(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'todos', id));
  }

  //SUBTASKS 

  async addSubTask(todoId: string, subTask: SubTask): Promise<void> {
    await updateDoc(doc(this.firestore, 'todos', todoId), {
      subTasks: arrayUnion(subTask),
      updatedAt: serverTimestamp(),
    });
  }

  async updateSubTasks(todoId: string, subTasks: SubTask[]): Promise<void> {
    await updateDoc(doc(this.firestore, 'todos', todoId), {
      subTasks,
      updatedAt: serverTimestamp(),
    });
  }

  async removeSubTask(todoId: string, subTask: SubTask): Promise<void> {
    await updateDoc(doc(this.firestore, 'todos', todoId), {
      subTasks: arrayRemove(subTask),
      updatedAt: serverTimestamp(),
    });
  }

  // PHOTOS 
  async addPhoto(todoId: string, photo: TodoPhoto): Promise<void> {
    await updateDoc(doc(this.firestore, 'todos', todoId), {
      photos: arrayUnion(photo),
      updatedAt: serverTimestamp(),
    });
  }

  async removePhoto(todoId: string, photo: TodoPhoto): Promise<void> {
    await updateDoc(doc(this.firestore, 'todos', todoId), {
      photos: arrayRemove(photo),
      updatedAt: serverTimestamp(),
    });
  }
}