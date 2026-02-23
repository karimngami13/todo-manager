import { Component, inject, computed, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { TodoService } from '../todo.service';
import { CategoryService } from '../../categories/category.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TodoFilterService, TimeView } from '../todo-filter.service';
import { TodoCardComponent } from '../todo-card/todo-card.component';
import { TodoStatus } from '../../../shared/models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [RouterLink, TodoCardComponent],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  private todoService = inject(TodoService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  readonly filterService = inject(TodoFilterService);

  // Convertit les Observables Firestore en Signals
  private allTodos = toSignal(this.todoService.getTodos(), { initialValue: [] });
  readonly categories = toSignal(this.categoryService.getCategories(), { initialValue: [] });

  // Todos filtrés — recalculé automatiquement quand les filtres ou données changent
  readonly filteredTodos = computed(() =>
    this.filterService.filterAndSort(this.allTodos())
  );

  // Compteurs par vue temporelle
  readonly counts = computed(() =>
    this.filterService.countByTimeView(this.allTodos())
  );

  readonly userEmail = this.authService.userEmail;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Actions filtres
  setTimeView(view: TimeView): void {
    this.filterService.selectedTimeView.set(view);
  }

  setStatus(status: TodoStatus | 'all'): void {
    this.filterService.selectedStatus.set(status);
  }

  setCategory(categoryId: string | 'all'): void {
    this.filterService.selectedCategoryId.set(categoryId);
  }

  // ─── Actions todos ─────────────────────────────────────────────────────────
  async deleteTodo(id: string): Promise<void> {
    if (!confirm('Supprimer ce todo ?')) return;
    try {
      await this.todoService.deleteTodo(id);
    } catch (e: any) {
      this.error.set(e.message);
    }
  }

  logout(): void {
    this.authService.signOut();
  }
}