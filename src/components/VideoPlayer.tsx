"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  poster: string;
}

export default function VideoPlayer({ url, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  
  let controlsTimeout: NodeJS.Timeout;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProgress(value);
    if (videoRef.current) {
      videoRef.current.currentTime = (videoRef.current.duration / 100) * value;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    if (isPlaying) {
      controlsTimeout = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(controlsTimeout);
  }, [isPlaying]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black group overflow-hidden shadow-2xl rounded-xl border border-white/5"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Background Poster Blur for aesthetic */}
      {!hasStarted && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}
      
      <video
        ref={videoRef}
        src={url}
        poster={poster}
        className="relative z-10 w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Play Overlay (when paused or haven't started) */}
      {!isPlaying && (
        <div 
          className="absolute z-20 inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity duration-300 backdrop-blur-sm"
          onClick={togglePlay}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-full p-5 md:p-6 transform transition-all duration-300 hover:scale-110 border border-white/30 shadow-2xl">
            <Play className="w-12 h-12 md:w-16 md:h-16 text-white fill-white ml-2" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div 
        className={`absolute z-30 bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 ease-in-out ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex flex-col gap-3">
          {/* Progress Bar */}
          <div className="relative h-1.5 md:h-2 group/progress cursor-pointer flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-full h-full bg-white/30 rounded-full overflow-hidden transition-all group-hover/progress:h-2 md:group-hover/progress:h-2.5">
              <div 
                className="h-full bg-accent rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-md" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-accent transition-transform hover:scale-110 active:scale-95">
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white" />}
              </button>
              <button onClick={toggleMute} className="text-white hover:text-accent transition-transform hover:scale-110 active:scale-95">
                {isMuted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
              </button>
            </div>
            
            <button onClick={toggleFullscreen} className="text-white hover:text-accent transition-transform hover:scale-110 active:scale-95">
              <Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
