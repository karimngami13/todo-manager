import { Injectable, signal, computed } from '@angular/core';
import { Todo, TodoStatus } from '../../shared/models/todo.model';
import { Timestamp } from '@angular/fire/firestore';

export type TimeView = 'all' | 'overdue' | 'today' | 'upcoming';

@Injectable({ providedIn: 'root' })
export class TodoFilterService {

  // State des filtres (Signals)
  readonly selectedStatus = signal<TodoStatus | 'all'>('all');
  readonly selectedCategoryId = signal<string | 'all'>('all');
  readonly selectedTimeView = signal<TimeView>('all');

  // Méthode principale de filtrage
  filterAndSort(todos: Todo[]): Todo[] {
    let result = [...todos];

    // Filtre par statut
    if (this.selectedStatus() !== 'all') {
      result = result.filter(t => t.status === this.selectedStatus());
    }

    // Filtre par catégorie
    if (this.selectedCategoryId() !== 'all') {
      result = result.filter(t => t.categoryId === this.selectedCategoryId());
    }

    // Filtre par vue temporelle
    result = result.filter(t => this.matchesTimeView(t));

    // Tri par deadline
    return result.sort((a, b) =>
      a.deadline.toMillis() - b.deadline.toMillis()
    );
  }

  private matchesTimeView(todo: Todo): boolean {
    if (this.selectedTimeView() === 'all') return true;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deadline = todo.deadline.toDate();

    switch (this.selectedTimeView()) {
      case 'overdue':
        return deadline < today && todo.status !== 'done' && todo.status !== 'archived';
      case 'today':
        return deadline >= today && deadline < tomorrow;
      case 'upcoming':
        return deadline >= tomorrow;
      default:
        return true;
    }
  }

  // Helpers pour compter les todos par vue
  countByTimeView(todos: Todo[]): Record<TimeView, number> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      all: todos.length,
      overdue: todos.filter(t => {
        const d = t.deadline.toDate();
        return d < today && t.status !== 'done' && t.status !== 'archived';
      }).length,
      today: todos.filter(t => {
        const d = t.deadline.toDate();
        return d >= today && d < tomorrow;
      }).length,
      upcoming: todos.filter(t => t.deadline.toDate() >= tomorrow).length,
    };
  }

  reset(): void {
    this.selectedStatus.set('all');
    this.selectedCategoryId.set('all');
    this.selectedTimeView.set('all');
  }
}