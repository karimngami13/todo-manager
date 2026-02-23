import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Timestamp } from '@angular/fire/firestore';

import { TodoService } from '../todo.service';
import { CategoryService } from '../../categories/category.service';
import { Todo } from '../../../shared/models/todo.model';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './todo-form.component.html',
})
export class TodoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private todoService = inject(TodoService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly categories = toSignal(this.categoryService.getCategories(), { initialValue: [] });
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditMode = signal(false);
  private todoId: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    status: ['todo', Validators.required],
    deadline: ['', Validators.required],
    categoryId: [null as string | null],
    subTasks: this.fb.array([]),
  });

  get subTasksArray(): FormArray {
    return this.form.get('subTasks') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.todoId = id;
      this.todoService.getTodoById(id).subscribe(todo => {
        if (todo) this.patchForm(todo);
      });
    }
  }

  private patchForm(todo: Todo): void {
    const deadlineStr = todo.deadline.toDate().toISOString().slice(0, 16);
    this.form.patchValue({
      title: todo.title,
      description: todo.description ?? '',
      status: todo.status,
      deadline: deadlineStr,
      categoryId: todo.categoryId,
    });
    // Reconstruire les sous-tâches
    this.subTasksArray.clear();
    todo.subTasks.forEach(st => {
      this.subTasksArray.push(this.fb.group({
        id: [st.id],
        title: [st.title, Validators.required],
        done: [st.done],
        createdAt: [st.createdAt],
      }));
    });
  }

  addSubTask(): void {
    this.subTasksArray.push(this.fb.group({
      id: [crypto.randomUUID()],
      title: ['', Validators.required],
      done: [false],
      createdAt: [Timestamp.now()],
    }));
  }

  removeSubTask(index: number): void {
    this.subTasksArray.removeAt(index);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const value = this.form.value;
      const deadline = Timestamp.fromDate(new Date(value.deadline!));
      const subTasks = this.subTasksArray.value;

      if (this.isEditMode() && this.todoId) {
        await this.todoService.updateTodo(this.todoId, {
          title: value.title!,
          description: value.description ?? undefined,
          status: value.status as any,
          deadline,
          categoryId: value.categoryId ?? null,
          subTasks,
        });
        await this.router.navigate(['/todos', this.todoId]);
      } else {
        const id = await this.todoService.createTodo({
          title: value.title!,
          description: value.description ?? undefined,
          status: 'todo',
          deadline,
          categoryId: value.categoryId ?? null,
          subTasks: [],
          photos: [],
        });
        await this.router.navigate(['/todos', id]);
      }
    } catch (e: any) {
      this.errorMessage.set(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}