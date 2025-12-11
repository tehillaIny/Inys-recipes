import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";


const CLOUDINARY_CLOUD_NAME = "dysrx5oeu";
const CLOUDINARY_UPLOAD_PRESET = "inys_recipes";

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
    
    // יצירת אובייקט חדש שמכיל את המידע שהתקבל + תאריכים
    const recipeWithDates = {
      ...data,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      createdBy: data.createdBy || "" // שדה יוצר (אם קיים)
    };

    const docRef = await addDoc(recipesRef, recipeWithDates);
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

// מחיקת מתכון לפי ID
export async function deleteRecipe(recipeId: string) {
  try {
    const recipeRef = doc(db, "recipes", recipeId);
    await deleteDoc(recipeRef);
    console.log("מתכון נמחק בהצלחה:", recipeId);
  } catch (err) {
    console.error("שגיאה במחיקת מתכון:", err);
    throw err;
  }
}

// ---------------------- IMAGES (CLOUDINARY) ----------------------

export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("שגיאה בהעלאת התמונה ל-Cloudinary");
    }

    const data = await response.json();
    return data.secure_url; 
  } catch (err) {
    console.error("שגיאה בהעלאת תמונה:", err);
    throw err;
  }
}

// פונקציית סנכרון תגיות - עוברת על כל המתכונים ומוודאה שהתגיות שלהם קיימות ברשימה הראשית
export async function syncMissingTags() {
  console.log("מתחיל סנכרון תגיות...");
  try {
    // 1. שליפת כל המתכונים
    const recipesRef = collection(db, "recipes");
    const recipesSnapshot = await getDocs(recipesRef);
    
    // 2. איסוף כל שמות התגיות מכל המתכונים
    const allTagsSet = new Set<string>();
    recipesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((t: string) => {
          if (t && t.trim()) allTagsSet.add(t.trim());
        });
      }
    });

    console.log(`נמצאו ${allTagsSet.size} תגיות ייחודיות במתכונים.`);

    // 3. הוספה של כל תגית (הפונקציה addTag שלנו כבר בודקת כפילויות, אז זה בטוח)
    let addedCount = 0;
    for (const tagName of Array.from(allTagsSet)) {
      await addTag(tagName); // הפונקציה הקיימת שלך שבודקת לפני הוספה
      addedCount++;
    }

    console.log("סנכרון הסתיים בהצלחה!");
    alert("סנכרון הושלם! כל הקטגוריות החסרות נוספו.");
  } catch (err) {
    console.error("שגיאה בסנכרון תגיות:", err);
    alert("אירעה שגיאה בסנכרון.");
  }
}

export async function updateRecipe(id: string, data: any) {
  try {
    const recipeRef = doc(db, "recipes", id);
    
    // הוספת תאריך עדכון למידע שנשלח לעדכון
    const dataWithUpdateDate = {
      ...data,
      updated_date: new Date().toISOString()
    };

    await updateDoc(recipeRef, dataWithUpdateDate);
    console.log("מתכון עודכן בהצלחה:", id);
  } catch (err) {
    console.error("שגיאה בעדכון מתכון:", err);
    throw err;
  }
}

export async function deleteTag(tagId: string) {
  try {
    const tagRef = doc(db, "tags", tagId);
    await deleteDoc(tagRef);
    console.log("תגית נמחקה בהצלחה:", tagId);
  } catch (err) {
    console.error("שגיאה במחיקת תגית:", err);
    throw err;
  }
}