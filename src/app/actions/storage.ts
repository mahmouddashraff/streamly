"use server";

import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("This module can only be run on the server.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// A list of all known tables and their columns that could potentially store a file URL
// We check these before deleting any file from Storage to ensure it's not shared.
const REFERENCE_CHECKS = [
  { table: "videos", columns: ["video_url", "thumbnail"] },
  { table: "podcasts", columns: ["video_url", "thumbnail"] },
  { table: "soon", columns: ["thumbnail"] },
  { table: "soon_images", columns: ["image_url"] },
  { table: "todays_events", columns: ["thumbnail"] },
  { table: "exclusives", columns: ["thumbnail"] },
  { table: "presenters", columns: ["image_url"] },
  { table: "guests", columns: ["image_url"] },
  { table: "channels", columns: ["logo_url"] },
  { table: "site_settings", columns: ["site_logo_url", "logo_en_url", "logo_ar_url", "hero_background_url"] },
];

export async function deleteStorageFiles(urls: (string | null | undefined)[]) {
  const validUrls = urls.filter((url): url is string => !!url && typeof url === "string");
  if (validUrls.length === 0) return { success: true };

  const storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/`;
  const results = [];

  for (const url of validUrls) {
    try {
      if (!url.startsWith(storageBaseUrl)) {
        results.push({ url, status: "skipped", reason: "not_supabase_storage_url" });
        continue;
      }

      const pathWithBucket = url.replace(storageBaseUrl, "");
      const firstSlashIndex = pathWithBucket.indexOf("/");
      if (firstSlashIndex === -1) {
         results.push({ url, status: "error", reason: "invalid_path" });
         continue;
      }

      const bucket = pathWithBucket.substring(0, firstSlashIndex);
      const filePath = pathWithBucket.substring(firstSlashIndex + 1);

      let isReferenced = false;
      for (const { table, columns } of REFERENCE_CHECKS) {
        for (const col of columns) {
          // We use head: true to only get count, not data
          const { count, error } = await adminClient
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq(col, url);
          
          if (error) {
            // Ignore if table/column doesn't exist (e.g. legacy table)
            if (error.code !== '42P01' && error.code !== '42703') {
              console.error(`Error checking reference for ${url} in ${table}.${col}:`, error);
            }
            continue;
          }

          if (count && count > 0) {
            isReferenced = true;
            break;
          }
        }
        if (isReferenced) break;
      }

      if (isReferenced) {
        results.push({ url, status: "skipped", reason: "file_still_referenced" });
        continue;
      }

      // Safe to delete
      const { error: deleteError } = await adminClient.storage.from(bucket).remove([filePath]);
      if (deleteError) {
        console.error(`Failed to delete storage file ${filePath} from ${bucket}:`, deleteError);
        results.push({ url, status: "error", error: deleteError.message });
      } else {
        results.push({ url, status: "deleted", bucket, filePath });
      }

    } catch (e: any) {
       console.error(`Exception during cleanup of ${url}:`, e);
       results.push({ url, status: "error", error: e.message });
    }
  }

  return { success: true, results };
}
