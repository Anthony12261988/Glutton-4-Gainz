"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX, SkipForward, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// Video files in Supabase Storage bucket "videos"
const INTRO_VIDEO_PATH = "intro/welcome.mp4";
const INTRO_POSTER_PATH = "intro/welcome-poster.jpg";

interface IntroVideoModalProps {
  userId: string;
  onComplete: () => void;
}

export function IntroVideoModal({ userId, onComplete }: IntroVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

  // Fetch video URLs from Supabase Storage
  useEffect(() => {
    const fetchVideoUrls = async () => {
      try {
        // Get public URLs for the video and poster
        const { data: videoData } = supabase.storage
          .from("videos")
          .getPublicUrl(INTRO_VIDEO_PATH);
        
        const { data: posterData } = supabase.storage
          .from("videos")
          .getPublicUrl(INTRO_POSTER_PATH);

        if (videoData?.publicUrl) {
          setVideoUrl(videoData.publicUrl);
        }
        if (posterData?.publicUrl) {
          setPosterUrl(posterData.publicUrl);
        }
      } catch (error) {
        console.error("Error fetching video URLs:", error);
        setVideoError(true);
      }
    };

    fetchVideoUrls();
  }, [supabase.storage]);

  // Allow skip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkip(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleVideoEnd = async () => {
    await markVideoWatched();
  };

  const handleSkip = async () => {
    await markVideoWatched();
  };

  const markVideoWatched = async () => {
    setIsClosing(true);
    
    try {
      await supabase
        .from("profiles")
        .update({ intro_video_watched: true })
        .eq("id", userId);
    } catch (error) {
      console.error("Error marking video as watched:", error);
    }
    
    // Small delay for animation
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div 
        className={`relative w-full max-w-4xl mx-4 transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-tactical-green rounded-full animate-pulse" />
            <h2 className="font-heading text-xl text-white uppercase tracking-wider">
              Welcome to Boot Camp, Soldier
            </h2>
          </div>
          {canSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-text hover:text-white gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip Intro
            </Button>
          )}
        </div>

        {/* Video Container */}
        <div className="relative rounded-lg overflow-hidden border-2 border-olive-drab/50 bg-camo-dark">
          {/* Tactical corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-tactical-green z-10" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-tactical-green z-10" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-tactical-green z-10" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-tactical-green z-10" />

          {/* Video element */}
          {videoError ? (
            <div className="w-full aspect-video bg-camo-dark flex flex-col items-center justify-center text-center p-8">
              <AlertCircle className="w-12 h-12 text-tactical-red mb-4" />
              <p className="text-high-vis font-heading mb-2">VIDEO UNAVAILABLE</p>
              <p className="text-muted-text text-sm mb-4">
                The intro video hasn't been uploaded yet.
              </p>
              <Button onClick={handleSkip} className="bg-tactical-green hover:bg-tactical-green/80">
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setVideoError(true)}
              playsInline
              poster={posterUrl || undefined}
              src={videoUrl || undefined}
            >
              Your browser does not support the video tag.
            </video>
          )}

          {/* Play overlay (shown when paused and video is available) */}
          {!isPlaying && !videoError && videoUrl && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer"
              onClick={handlePlay}
            >
              <div className="w-20 h-20 rounded-full bg-tactical-green/90 flex items-center justify-center hover:bg-tactical-green transition-colors">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-600 rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-tactical-green transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              {/* Play/Pause button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={isPlaying ? handlePause : handlePlay}
                className="text-white hover:text-tactical-green"
              >
                {isPlaying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 flex gap-0.5">
                      <div className="w-1 h-3 bg-current" />
                      <div className="w-1 h-3 bg-current" />
                    </div>
                    Pause
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Play
                  </span>
                )}
              </Button>

              {/* Mute button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:text-tactical-green"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-6 text-center">
          <p className="text-muted-text text-sm">
            Your training begins now. Watch this briefing to understand your mission.
          </p>
          {!canSkip && (
            <p className="text-muted-text/60 text-xs mt-2">
              Skip available in a few seconds...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
