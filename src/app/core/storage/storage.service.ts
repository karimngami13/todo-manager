import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface UploadProgress {
  progress: number;
  url?: string;
  path?: string;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);
  private auth = inject(AuthService);

  // Upload avec suivi de progression
  uploadPhoto(todoId: string, file: File): Observable<UploadProgress> {
    const uid = this.auth.uid()!;
    // Structure du path : todos/{uid}/{todoId}/{timestamp}_{filename}
    const path = `todos/${uid}/${todoId}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file);

    return new Observable(observer => {
      task.on(
        'state_changed',
        snapshot => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          observer.next({ progress });
        },
        error => observer.error(error),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          observer.next({ progress: 100, url, path });
          observer.complete();
        }
      );
    });
  }

  // Suppression du fichier dans Storage
  async deletePhoto(storagePath: string): Promise<void> {
    await deleteObject(ref(this.storage, storagePath));
  }
}