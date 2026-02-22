import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

// Protège les routes privées -redirige vers login si non connecté
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => user ? true : router.createUrlTree(['/auth/login']))
  );
};

// Protège les routes publiques - redirige vers todos si déjà connecté
export const publicGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => user ? router.createUrlTree(['/todos']) : true)
  );
};