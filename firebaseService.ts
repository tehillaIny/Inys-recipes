import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// טיפוס תגית
export interface Tag {
  id: string;
  name: string;
}

// ---------------------- RECIPES ----------------------

// הוספת מתכון
export async function addRecipe(data: any) {
  try {
    const recipesRef = collection(db, "recipes");
    const docRef = await addDoc(recipesRef, data);
    console.log("מתכון נוסף עם ID:", docRef.id);
    return docRef;
  } catch (err) {
    console.error("שגיאה בהוספת מתכון:", err);
    throw err;
  }
}

// הבאת כל המתכונים
export async function getRecipes() {
  try {
    const recipesRef = collection(db, "recipes");
    const snapshot = await getDocs(recipesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("שגיאה בשליפת מתכונים:", err);
    return [];
  }
}

// ---------------------- TAGS ----------------------

// הבאת כל התגיות
export async function getTags(): Promise<Tag[]> {
  try {
    const tagsRef = collection(db, "tags");
    const snapshot = await getDocs(tagsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name ?? ""
    }));
  } catch (err) {
    console.error("שגיאה בשליפת תגיות:", err);
    return [];
  }
}

// הוספת תגית חדשה
export async function addTag(name: string) {
  try {
    const tagsRef = collection(db, "tags");
    await addDoc(tagsRef, { name });
  } catch (err) {
    console.error("שגיאה בהוספת תגית:", err);
    throw err;
  }
}