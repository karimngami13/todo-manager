import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass, PercentPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

import { TodoService } from '../todo.service';
import { CategoryService } from '../../categories/category.service';
import { StorageService } from '../../../core/storage/storage.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Todo, SubTask, TodoPhoto } from '../../../shared/models/todo.model';

@Component({
  selector: 'app-todo-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass, PercentPipe],
  templateUrl: './todo-detail.component.html',
})
export class TodoDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private todoService = inject(TodoService);
  private categoryService = inject(CategoryService);
  private storageService = inject(StorageService);
  private authService = inject(AuthService);

  // Charge le todo réactif basé sur l'ID dans l'URL
  private todoId = this.route.snapshot.paramMap.get('id')!;
  readonly todo = toSignal(this.todoService.getTodoById(this.todoId));
  readonly categories = toSignal(
    this.categoryService.getCategories(),
    { initialValue: [] }
  );

  // State local
  readonly isDeleting = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);

  get category() {
    return this.categories().find(c => c.id === this.todo()?.categoryId);
  }

  get statusLabel(): Record<string, string> {
    return {
      todo: 'À faire',
      in_progress: 'En cours',
      done: 'Terminé',
      archived: 'Archivé'
    };
  }

  // Sous-tâches 

  async toggleSubTask(subTask: SubTask): Promise<void> {
    const todo = this.todo();
    if (!todo) return;

    const updated = todo.subTasks.map(st =>
      st.id === subTask.id ? { ...st, done: !st.done } : st
    );
    await this.todoService.updateSubTasks(this.todoId, updated);
    // La Cloud Function computeProgress se déclenche automatiquement
  }

  // Photos 

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    this.errorMessage.set(null);

    // Upload chaque fichier séquentiellement
    for (const file of Array.from(files)) {
      await this.uploadSinglePhoto(file);
    }

    // Reset l'input pour permettre de re-sélectionner le même fichier
    input.value = '';
  }

  private uploadSinglePhoto(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storageService.uploadPhoto(this.todoId, file).subscribe({
        next: result => {
          this.uploadProgress.set(result.progress);

          if (result.progress === 100 && result.url && result.path) {
            const photo: TodoPhoto = {
              id: crypto.randomUUID(),
              storagePath: result.path,
              url: result.url,
              createdAt: Timestamp.now(),
            };
            this.todoService.addPhoto(this.todoId, photo)
              .then(() => {
                this.uploadProgress.set(null);
                resolve();
              })
              .catch(reject);
          }
        },
        error: err => {
          this.errorMessage.set('Erreur upload : ' + err.message);
          this.uploadProgress.set(null);
          reject(err);
        }
      });
    });
  }

  async deletePhoto(photo: TodoPhoto): Promise<void> {
    if (!confirm('Supprimer cette photo ?')) return;
    try {
      // 1. Supprimer de Storage
      await this.storageService.deletePhoto(photo.storagePath);
      // 2. Supprimer la référence dans Firestore
      await this.todoService.removePhoto(this.todoId, photo);
    } catch (e: any) {
      this.errorMessage.set('Erreur suppression : ' + e.message);
    }
  }

  // Todo actions

  async deleteTodo(): Promise<void> {
    if (!confirm('Supprimer ce todo définitivement ?')) return;
    this.isDeleting.set(true);
    try {
      await this.todoService.deleteTodo(this.todoId);
      await this.router.navigate(['/todos']);
    } catch (e: any) {
      this.errorMessage.set(e.message);
      this.isDeleting.set(false);
    }
  }
}