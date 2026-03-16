import { getBreedImageSrc, FALLBACK_IMG } from "../lib/breeds";

interface DogAvatarProps {
  breed: string | null;
  size?: "sm" | "md";
  className?: string;
}

// Rounded-square breed image avatar with emoji fallback
export default function DogAvatar({ breed, size = "md", className = "" }: DogAvatarProps) {
  const src = getBreedImageSrc(breed);
  const sizeClass = size === "sm" ? "w-9 h-9" : "w-10 h-10";

  return (
    <div className={`${sizeClass} rounded-xl overflow-hidden bg-cream border border-cream-dark shrink-0 ${className}`}>
      <img
        src={src}
        alt={breed ?? "Dog"}
        className="w-full h-full object-cover object-top"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
      />
    </div>
  );
}
