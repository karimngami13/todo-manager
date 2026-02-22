import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User
} from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // ─── State ────────────────────────────────────────────────────────────────
  // authState() retourne un Observable<User|null> que Firebase met à jour
  // automatiquement. toSignal() le convertit en Signal Angular réactif.
  readonly user = toSignal(authState(this.auth));
  readonly isLoggedIn = () => !!this.user();
  readonly uid = () => this.user()?.uid ?? null;
  readonly userEmail = () => this.user()?.email ?? null;

  // ─── Actions ──────────────────────────────────────────────────────────────
  async signUp(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      await this.router.navigate(['/todos']);
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      await this.router.navigate(['/todos']);
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(this.auth, new GoogleAuthProvider());
      await this.router.navigate(['/todos']);
    } catch (error) {
      throw this.mapFirebaseError(error);
    }
  }

  async signOut(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigate(['/auth/login']);
  }

  // ─── Helper — messages d'erreur lisibles ──────────────────────────────────
  private mapFirebaseError(error: any): Error {
    const code = error?.code ?? '';
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'Cet email est déjà utilisé.',
      'auth/invalid-email': 'Adresse email invalide.',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
      'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/invalid-credential': 'Email ou mot de passe incorrect.',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      'auth/popup-closed-by-user': 'Connexion annulée.',
    };
    return new Error(messages[code] ?? 'Une erreur est survenue.');
  }
}