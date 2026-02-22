import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Category, CategoryCreate, CategoryUpdate } from '../../shared/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private get categoriesRef() {
    return collection(this.firestore, 'categories');
  }

  //  READ 

  getCategories(): Observable<Category[]> {
    const q = query(
      this.categoriesRef,
      where('uid', '==', this.auth.uid()!),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Category[]>;
  }

  //  CREATE 

  async createCategory(data: Omit<CategoryCreate, 'uid'>): Promise<string> {
    const ref = await addDoc(this.categoriesRef, {
      ...data,
      uid: this.auth.uid(),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  //  UPDATE 

  async updateCategory(id: string, data: CategoryUpdate): Promise<void> {
    await updateDoc(doc(this.firestore, 'categories', id), data);
  }

  //  DELETE 
  /**
   * Décision technique documentée :
   * La suppression d'une catégorie NE supprime PAS les todos associés.
   * Les todos gardent leur categoryId (orphelin).
   * L'UI les affiche comme "Sans catégorie".
   * Raison : éviter des écritures en cascade non contrôlées sur Firestore.
   */
  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'categories', id));
  }
}