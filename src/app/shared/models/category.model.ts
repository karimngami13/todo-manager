import { Timestamp } from '@angular/fire/firestore';

export interface Category {
  id: string;
  uid: string;
  name: string;
  color?: string;   // couleur
  createdAt: Timestamp;
}

export type CategoryCreate = Omit<Category, 'id' | 'createdAt'>;
export type CategoryUpdate = Partial<Pick<Category, 'name' | 'color'>>;