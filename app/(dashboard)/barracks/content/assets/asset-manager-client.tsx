"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Copy, Check } from "lucide-react";
import { uploadImage } from "@/lib/utils/image-upload";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AssetManagerClient() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    setUploading(true);
    try {
      const file = e.target.files[0];
      const url = await uploadImage(file, "content_assets", "general");
      setUploadedUrl(url);
      toast({
        title: "Success",
        description: "Asset uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "URL copied to clipboard.",
    });
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
          Asset Depot
        </h1>

        <Card className="bg-gunmetal border-steel/20">
          <CardHeader>
            <CardTitle className="text-white">Upload New Asset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-steel/30 border-dashed rounded-lg cursor-pointer bg-black/20 hover:bg-black/30"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-steel" />
                  <p className="mb-2 text-sm text-steel">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-steel/50">
                    SVG, PNG, JPG or GIF (MAX. 10MB)
                  </p>
                </div>
                <Input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </Label>
            </div>

            {uploading && (
              <div className="text-center text-tactical-red animate-pulse">
                Uploading asset...
              </div>
            )}

            {uploadedUrl && (
              <div className="space-y-2">
                <Label className="text-steel">Asset URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={uploadedUrl}
                    readOnly
                    className="bg-black/20 border-steel/30 text-steel"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="border-steel/30 hover:bg-steel/20"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
