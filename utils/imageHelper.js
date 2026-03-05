const DEFAULT_IMAGE = "/defualt_img.jpg";
const OLD_UNSPLASH_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

export const getDisplayImage = (url) => {
  if (!url) return DEFAULT_IMAGE;
  if (url === OLD_UNSPLASH_IMAGE) return DEFAULT_IMAGE;
  if (url.includes("images.unsplash.com/photo-1546069901")) return DEFAULT_IMAGE;
  return url;
};

export const optimizeImage = (url, width, height = null, mode = 'fill') => {
  if (!url || !url.includes('cloudinary.com')) return url;
  if (url.includes('/upload/c_')) return url; // מונע כיווץ כפול
  
  const sizeParam = height ? `w_${width},h_${height}` : `w_${width}`;
  return url.replace('/upload/', `/upload/c_${mode},${sizeParam},q_auto,f_auto/`);
};