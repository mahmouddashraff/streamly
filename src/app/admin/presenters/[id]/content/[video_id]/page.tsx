"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This file exists to fix a Next.js App Router bug where the lack of a page.tsx 
// inside a dynamic segment ([video_id]) causes static segments (like 'new') 
// adjacent to it to resolve to 404.
export default function PassThroughPage({ params }: { params: any }) {
  const router = useRouter();
  
  useEffect(() => {
    // If someone accidentally navigates to this exact folder without /edit, redirect them.
    const url = window.location.pathname;
    if (!url.endsWith('/edit')) {
      router.replace(url + '/edit');
    }
  }, [router]);

  return <div className="p-8">Loading editor...</div>;
}
