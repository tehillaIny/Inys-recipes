import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// טיפוס תגית
export interface Tag {
  id: string;
  name: string;
}

// הוספת מתכון
export async function addRecipe(data: any) {
  const recipesRef = collection(db, "recipes");
  await addDoc(recipesRef, data);
}

// הבאת כל התגיות
export async function getTags(): Promise<Tag[]> {
  const tagsRef = collection(db, "tags");
  const snapshot = await getDocs(tagsRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name ?? "" // ודא שתמיד מחזיר name
  }));
}

// הוספת תגית חדשה
export async function addTag(name: string) {
  const tagsRef = collection(db, "tags");
  await addDoc(tagsRef, { name });
}

export async function getRecipes() {
  const recipesRef = collection(db, "recipes");
  const snapshot = await getDocs(recipesRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}