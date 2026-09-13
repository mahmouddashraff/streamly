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
  const containerRef = React.useRef<HTMLDivElement>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoDebug, setVideoDebug] = useState<any>({});

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

  const isVideo = ad?.media_type === 'video';

  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    const v = videoRef.current;
    
    const updateDebug = (eventName: string) => {
      setVideoDebug((prev: any) => ({
        ...prev,
        [eventName]: {
          src: v.currentSrc,
          readyState: v.readyState,
          networkState: v.networkState,
          width: v.videoWidth,
          height: v.videoHeight,
          error: v.error ? v.error.message : null,
          paused: v.paused,
          muted: v.muted,
          clientWidth: v.clientWidth,
          clientHeight: v.clientHeight,
        }
      }));
      console.log(`[VideoEvent: ${eventName}]`, {
        src: v.currentSrc,
        readyState: v.readyState,
        networkState: v.networkState,
        width: v.videoWidth,
        height: v.videoHeight,
        error: v.error,
        paused: v.paused,
        muted: v.muted,
        clientWidth: v.clientWidth,
        clientHeight: v.clientHeight,
      });
    };

    const events = ['loadedmetadata', 'loadeddata', 'canplay', 'error', 'play', 'playing', 'pause', 'suspend', 'stalled'];
    const handlers = events.map(e => () => updateDebug(e));
    
    events.forEach((e, i) => v.addEventListener(e, handlers[i]));
    
    // Initial log
    updateDebug('mounted');

    return () => {
      events.forEach((e, i) => v.removeEventListener(e, handlers[i]));
    };
  }, [isVideo]);

  if (!ad || !ad.image_url) return null;

  const clickBehavior = ad.click_behavior || 'link';

  const defaultMediaClass = "w-full h-full object-cover";
  const appliedMediaClass = mediaClassName || defaultMediaClass;

  const mediaElement = isVideo ? (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Diagnostic Overlay */}
      <div className="absolute top-0 left-0 right-0 bg-red-600/90 text-white text-[8px] sm:text-[10px] p-1 z-50 overflow-y-auto max-h-full font-mono break-all whitespace-pre-wrap pointer-events-none">
        {JSON.stringify(videoDebug, null, 1)}
      </div>
      
      {/* Foreground actual media */}
      <video
        ref={videoRef}
        src={ad.image_url}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        className={cn("relative z-10 bg-blue-900/50", appliedMediaClass)}
        onError={(e) => {
          console.error("Advertisement Foreground Video Error: ", e);
        }}
      />
    </div>
  ) : (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/5">
      {/* Image actual media */}
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
          ref={containerRef as any}
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
          ref={containerRef as any}
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
