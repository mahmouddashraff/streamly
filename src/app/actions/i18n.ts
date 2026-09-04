"use server";

import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n";

export async function setLanguage(lang: Locale) {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 }); // 1 year
}
