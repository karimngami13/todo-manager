import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { Todo } from '../../../shared/models/todo.model';
import { Category } from '../../../shared/models/category.model';

@Component({
  selector: 'app-todo-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './todo-card.component.html',
})
export class TodoCardComponent {
  @Input({ required: true }) todo!: Todo;
  @Input() categories: Category[] = [];
  @Output() onDelete = new EventEmitter<string>();

  get category() {
    return this.categories.find(c => c.id === this.todo.categoryId);
  }

  get isOverdue(): boolean {
    const deadline = this.todo.deadline.toDate();
    return deadline < new Date() &&
      this.todo.status !== 'done' &&
      this.todo.status !== 'archived';
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      todo: 'À faire',
      in_progress: 'En cours',
      done: 'Terminé',
      archived: 'Archivé'
    };
    return labels[this.todo.status] ?? this.todo.status;
  }
}