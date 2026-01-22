"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadVideoAsset } from "@/lib/utils/image-upload";

const INTRO_VIDEO_PATH = "intro/welcome.mp4";
const INTRO_POSTER_PATH = "intro/welcome-poster.jpg";

export function VideoManagerClient() {
  const { toast } = useToast();
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [videoPath, setVideoPath] = useState("");
  const [posterPath, setPosterPath] = useState("");

  const handleIntroVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please upload a video file (mp4, webm, ogg).",
        variant: "destructive",
      });
      return;
    }

    setUploadingVideo(true);
    try {
      const path = await uploadVideoAsset(file, INTRO_VIDEO_PATH, {
        upsert: true,
      });
      setVideoPath(path);
      toast({
        title: "Success",
        description: "Intro video uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePosterUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (jpg, png, webp).",
        variant: "destructive",
      });
      return;
    }

    setUploadingPoster(true);
    try {
      const path = await uploadVideoAsset(file, INTRO_POSTER_PATH, {
        upsert: true,
      });
      setPosterPath(path);
      toast({
        title: "Success",
        description: "Poster image uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPoster(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 text-white">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link
          href="/barracks"
          className="flex items-center text-steel hover:text-white mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Barracks
        </Link>

        <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis mb-8">
          Video Depot
        </h1>

        <Card className="bg-gunmetal border-steel/20">
          <CardHeader>
            <CardTitle className="text-white">Intro Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="intro-video">Intro Video File</Label>
              <Input
                id="intro-video"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleIntroVideoUpload}
                disabled={uploadingVideo}
              />
              <p className="text-xs text-steel">
                Uploads to: <span className="text-high-vis">{INTRO_VIDEO_PATH}</span>
              </p>
              {uploadingVideo && (
                <p className="text-sm text-tactical-red animate-pulse">
                  Uploading intro video...
                </p>
              )}
              {videoPath && (
                <p className="text-xs text-radar-green">Uploaded: {videoPath}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="intro-poster">Intro Poster Image</Label>
              <Input
                id="intro-poster"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePosterUpload}
                disabled={uploadingPoster}
              />
              <p className="text-xs text-steel">
                Uploads to: <span className="text-high-vis">{INTRO_POSTER_PATH}</span>
              </p>
              {uploadingPoster && (
                <p className="text-sm text-tactical-red animate-pulse">
                  Uploading poster image...
                </p>
              )}
              {posterPath && (
                <p className="text-xs text-radar-green">
                  Uploaded: {posterPath}
                </p>
              )}
            </div>

            <div className="rounded-sm border border-steel/30 bg-black/20 p-4 text-xs text-steel">
              <p className="mb-1 font-bold text-high-vis">Notes</p>
              <p>Intro video and poster are stored in the private videos bucket.</p>
              <p>Signed URLs are generated at runtime for playback.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
