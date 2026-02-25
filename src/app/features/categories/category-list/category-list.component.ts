import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryService } from '../category.service';
import { Category } from '../../../shared/models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './category-list.component.html',
})
export class CategoryListComponent {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  readonly categories = toSignal(
    this.categoryService.getCategories(),
    { initialValue: [] }
  );

  // State
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);

  // Formulaire création
  createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    color: ['#6366f1'],
  });

  // Formulaire édition inline
  editForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    color: ['#6366f1'],
  });

  // Création
  async onCreate(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const { name, color } = this.createForm.value;
      await this.categoryService.createCategory({
        name: name!,
        color: color ?? undefined,
      });
      this.createForm.reset({ name: '', color: '#6366f1' });
    } catch (e: any) {
      this.errorMessage.set(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  //  Édition inline 
  startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.editForm.patchValue({
      name: category.name,
      color: category.color ?? '#6366f1',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editForm.reset();
  }

  async onUpdate(id: string): Promise<void> {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    try {
      const { name, color } = this.editForm.value;
      await this.categoryService.updateCategory(id, {
        name: name!,
        color: color ?? undefined,
      });
      this.editingId.set(null);
    } catch (e: any) {
      this.errorMessage.set(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Suppression
  async onDelete(id: string): Promise<void> {
    if (!confirm(
      'Supprimer cette catégorie ?\n\n' +
      'Les todos associés seront affichés sans catégorie.'
    )) return;

    this.isLoading.set(true);
    try {
      await this.categoryService.deleteCategory(id);
    } catch (e: any) {
      this.errorMessage.set(e.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}