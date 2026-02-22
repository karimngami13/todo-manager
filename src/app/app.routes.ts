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

  { path: '**', redirectTo: 'todos' }
];