"use client";

import Link from "next/link";
import { getLocalizedField } from "@/lib/i18n";
import { useI18n } from "@/components/I18nProvider";

interface EntityCardProps {
  entity: any;
  type: "presenter" | "guest" | "channel" | "podcast" | "exclusive" | "todays_event" | "soon";
}

export default function EntityCard({ entity, type }: EntityCardProps) {
  const { locale } = useI18n();

  // Handle URL pluralization manually for 'todays-events' vs standard 's' postfix
  let href = type === "todays_event" ? `/todays-events/${entity.id}` : type === "soon" ? `/soon/${entity.id}` : `/${type}s/${entity.id}`;
  
  // Extract common fields depending on the entity type
  let imageUrl = "";
  let name = "";

  if (type === "presenter" || type === "guest") {
    imageUrl = entity.image_url || "";
    name = getLocalizedField(entity, 'name', locale);
  } else if (type === "channel") {
    imageUrl = entity.logo_url || "";
    name = getLocalizedField(entity, 'name', locale);
  } else if (type === "podcast" || type === "exclusive" || type === "todays_event" || type === "soon") {
    imageUrl = entity.thumbnail || "";
    name = getLocalizedField(entity, 'title', locale);
  }

  return (
    <Link href={href} className="block group w-full outline-none focus:ring-2 focus:ring-white/50 rounded-lg">
      <div className="relative aspect-[3/4] sm:aspect-square md:aspect-video rounded-lg overflow-hidden bg-muted border border-white/5 shadow-md">
        {/* Profile/Logo Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110 group-focus:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
            No Image
          </div>
        )}
        
        {/* Subtle Dark Gradient for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
      </div>

      <div className="mt-3 px-1 text-center md:text-start">
        <h3 className="font-semibold text-sm md:text-base text-white/90 truncate transition-colors group-hover:text-white">
          {name}
        </h3>
        <p className="text-xs text-gray-400 capitalize mt-0.5">
          {type === "todays_event" ? "Today's Event" : type}
        </p>
      </div>
    </Link>
  );
}
