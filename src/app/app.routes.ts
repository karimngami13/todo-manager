import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'todos', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component')
            .then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () =>
          import('./features/auth/signup/signup.component')
            .then(m => m.SignupComponent)
      },
    ]
  },

  {
    path: 'todos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/todos/todo-list/todo-list.component')
        .then(m => m.TodoListComponent)
  },
  {
    path: 'todos/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/todos/todo-form/todo-form.component')
        .then(m => m.TodoFormComponent)
  },
  {
    path: 'todos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/todos/todo-detail/todo-detail.component')
        .then(m => m.TodoDetailComponent)
  },
  {
    path: 'todos/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/todos/todo-form/todo-form.component')
        .then(m => m.TodoFormComponent)
  },

  // routes catégories
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/category-list/category-list.component')
        .then(m => m.CategoryListComponent)
  },

  { path: '**', redirectTo: 'todos' }
];