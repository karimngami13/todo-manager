import * as admin from 'firebase-admin';
import { onDocumentWritten, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// ─────────────────────────────────────────────────────────────────────────────
// Function 1 — Calcul automatique du progress des sous-tâches
// ─────────────────────────────────────────────────────────────────────────────
export const computeProgress = onDocumentWritten(
  'todos/{todoId}',
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    const subTasks = after['subTasks'] ?? [];
    const progress = subTasks.length === 0
      ? 0
      : Math.round(
          (subTasks.filter((t: any) => t.done).length / subTasks.length) * 100
        );

    // Évite la boucle infinie
    if (after['progress'] !== progress) {
      await event.data!.after.ref.update({ progress });
      console.log(`[computeProgress] Todo ${event.params.todoId} → ${progress}%`);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Function 2 — Suppression des photos Storage quand un todo est supprimé
// ─────────────────────────────────────────────────────────────────────────────
export const cleanupTodoStorage = onDocumentDeleted(
  'todos/{todoId}',
  async (event) => {
    const photos: { storagePath: string }[] = event.data?.data()?.['photos'] ?? [];
    if (photos.length === 0) return;

    const bucket = storage.bucket();
    await Promise.all(
      photos.map(photo =>
        bucket.file(photo.storagePath).delete().catch(() => {
          console.warn(`[cleanupStorage] Fichier introuvable : ${photo.storagePath}`);
        })
      )
    );
    console.log(`[cleanupStorage] ${photos.length} photo(s) supprimée(s)`);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Function 3 — Archivage automatique des todos en retard (toutes les heures)
// ─────────────────────────────────────────────────────────────────────────────
export const markOverdueTodos = onSchedule(
  'every 60 minutes',
  async () => {
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db.collection('todos')
      .where('status', 'in', ['todo', 'in_progress'])
      .where('deadline', '<', now)
      .get();

    if (snapshot.empty) {
      console.log('[markOverdue] Aucun todo en retard');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc =>
      batch.update(doc.ref, {
        status: 'archived',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    );

    await batch.commit();
    console.log(`[markOverdue] ${snapshot.size} todos archivés`);
  }
);