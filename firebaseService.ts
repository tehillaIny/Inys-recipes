import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

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

// הבאת כל התגיות (עם סינון כפילויות)
export async function getTags(): Promise<Tag[]> {
  try {
    const tagsRef = collection(db, "tags");
    const snapshot = await getDocs(tagsRef);
    
    const rawTags = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name ?? ""
    }));

    // סינון כפילויות: משאירים רק את המופע הראשון של כל שם תגית
    const uniqueTags = rawTags.filter((tag, index, self) =>
      index === self.findIndex((t) => t.name === tag.name)
    );

    return uniqueTags;
  } catch (err) {
    console.error("שגיאה בשליפת תגיות:", err);
    return [];
  }
}

// הוספת תגית חדשה (רק אם לא קיימת כבר)
export async function addTag(name: string) {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const tagsRef = collection(db, "tags");

    // בדיקה אם התגית כבר קיימת במסד הנתונים
    const q = query(tagsRef, where("name", "==", trimmedName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log(`התגית "${trimmedName}" כבר קיימת, מדלג על הוספה.`);
      return; // יוצאים מהפונקציה בלי להוסיף כפילות
    }

    // אם לא קיימת - מוסיפים
    await addDoc(tagsRef, { name: trimmedName });
  } catch (err) {
    console.error("שגיאה בהוספת תגית:", err);
    throw err;
  }
}