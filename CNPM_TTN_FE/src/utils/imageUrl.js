const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5126";

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='18' fill='%23f3f4f6'/%3E%3Cpath d='M42 105l25-30 18 21 12-14 21 23H42z' fill='%23c7a17a'/%3E%3Ccircle cx='105' cy='55' r='12' fill='%23415167'/%3E%3Ctext x='80' y='132' text-anchor='middle' font-family='Arial' font-size='12' fill='%236b7280'%3ENo image%3C/text%3E%3C/svg%3E";

const hasImageExtension = (value) => /\.(png|jpe?g|webp|gif|svg)$/i.test(value);

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return PLACEHOLDER_IMAGE;

  const value = String(imageUrl).trim();
  if (!value) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/assets/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;
  if (value.startsWith("/uploads/")) return `${API_BASE_URL}${value}`;
  if (value.startsWith("uploads/")) return `${API_BASE_URL}/${value}`;
  if (/^image\d+\.(png|jpe?g|webp|gif|svg)$/i.test(value)) return `/assets/img/section2/${value}`;
  if (hasImageExtension(value)) return `/assets/img/section2/${value}`;

  return PLACEHOLDER_IMAGE;
};

export const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = PLACEHOLDER_IMAGE;
};
