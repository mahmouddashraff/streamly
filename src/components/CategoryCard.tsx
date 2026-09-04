import Link from "next/link";

interface CategoryCardProps {
  name: string;
}

export default function CategoryCard({ name }: CategoryCardProps) {
  // Generate a distinct gradient based on category name
  const getGradient = (name: string) => {
    const gradients: Record<string, string> = {
      "Action": "from-red-900 to-orange-900",
      "Drama": "from-purple-900 to-indigo-900",
      "Comedy": "from-yellow-700 to-amber-900",
      "Documentary": "from-green-900 to-emerald-900",
      "Adventure": "from-blue-900 to-cyan-900",
      "Thriller": "from-slate-800 to-zinc-900",
      "Sci-Fi": "from-indigo-900 to-blue-900",
      "Fantasy": "from-fuchsia-900 to-pink-900",
    };
    return gradients[name] || "from-gray-800 to-gray-900";
  };

  return (
    <Link href={`/search?q=${encodeURIComponent(name)}`} className="block group">
      <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${getGradient(name)} p-6 flex items-end shadow-lg transition-transform duration-300 group-hover:scale-105 border border-white/5 group-hover:border-white/20`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
        <h3 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md">
          {name}
        </h3>
      </div>
    </Link>
  );
}
