"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface AdvertisementData {
  id: string;
  name: string;
  image_url: string;
  destination_url: string;
  position: 'left' | 'right' | 'both' | 'ads_page' | 'ads_page_left' | 'ads_page_right' | 'ads_page_both';
  click_behavior?: 'link' | 'image';
  media_type?: 'image' | 'video';
}

interface AdvertisementProps {
  ad: AdvertisementData;
  className?: string;
  mediaClassName?: string;
  children?: React.ReactNode;
}

export default function Advertisement({ ad, className, mediaClassName, children }: AdvertisementProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isViewerOpen) {
        setIsViewerOpen(false);
      }
    };
    
    if (isViewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isViewerOpen]);

  if (!ad || !ad.image_url) return null;

  // Gracefully fallback to 'link' if the column doesn't exist yet
  const clickBehavior = ad.click_behavior || 'link';

  const isVideo = ad.media_type === 'video';

  const defaultMediaClass = "w-full h-full object-cover";
  const appliedMediaClass = mediaClassName || defaultMediaClass;

  const mediaElement = isVideo ? (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Foreground actual media */}
      <video
        src={ad.image_url}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        className={cn("relative z-10", appliedMediaClass)}
        onError={(e) => {
          console.error("Advertisement Foreground Video Error: ", e);
        }}
      />
    </div>
  ) : (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background blurred layer */}
      <img
        src={ad.image_url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110 pointer-events-none -z-10"
      />
      {/* Foreground actual media */}
      <img
        src={ad.image_url}
        alt={ad.name}
        className={cn("relative z-10", appliedMediaClass)}
        onError={(e) => {
          console.error("Advertisement Image Error: ", e);
        }}
      />
    </div>
  );

  const content = children || mediaElement;

  return (
    <>
      {clickBehavior === 'image' ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsViewerOpen(true);
          }}
          className={cn("flex flex-col overflow-hidden transition-opacity hover:opacity-90 cursor-pointer appearance-none bg-transparent border-none p-0 text-left w-full h-full", className)}
          title={ad.name}
        >
          {content}
        </button>
      ) : (
        <a
          href={ad.destination_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("flex flex-col overflow-hidden transition-opacity hover:opacity-90 w-full h-full", className)}
          title={ad.name}
        >
          {content}
        </a>
      )}

      {isViewerOpen && isMounted && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95"
          onClick={() => setIsViewerOpen(false)}
        >
          <button
            onClick={() => setIsViewerOpen(false)}
            className="fixed top-4 right-4 md:top-6 md:right-6 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-colors shadow-lg z-[10000] border border-white/20"
            aria-label="Close image viewer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {isVideo ? (
            <video
              src={ad.image_url}
              controls
              autoPlay
              className="w-auto h-auto max-w-[95vw] md:max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the video itself
            />
          ) : (
            <img
              src={ad.image_url}
              alt={ad.name}
              className="w-auto h-auto max-w-[95vw] md:max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          )}
        </div>,
        document.body
      )}
    </>
  );
}
