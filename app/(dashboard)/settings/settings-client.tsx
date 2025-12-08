"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Shield,
  Save,
  Upload,
  ArrowLeft,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SettingsClientProps {
  userId: string;
  profile: any;
}

export function SettingsClient({ userId, profile }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isCoach = profile?.role === "coach";

  const [formData, setFormData] = useState({
    email: profile?.email || "",
    avatar_url: profile?.avatar_url || "",
    bio: profile?.bio || "",
    specialties: profile?.specialties || "",
    certifications: profile?.certifications || "",
    years_experience: profile?.years_experience || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || "");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "INVALID FILE",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "FILE TOO LARGE",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public-files")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("public-files").getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      setPreviewUrl(publicUrl);

      toast({
        title: "UPLOAD SUCCESSFUL",
        description: "Avatar image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "UPLOAD FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        avatar_url: formData.avatar_url,
      };

      // Add coach-specific fields only if user is a coach
      if (isCoach) {
        updateData.bio = formData.bio;
        updateData.specialties = formData.specialties;
        updateData.certifications = formData.certifications;
        updateData.years_experience = formData.years_experience
          ? parseInt(formData.years_experience)
          : null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "PROFILE UPDATED",
        description: "Your profile has been successfully updated",
      });

      router.push("/profile");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "UPDATE FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "VALIDATION ERROR",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "PASSWORD TOO SHORT",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "PASSWORDS DON'T MATCH",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "PASSWORD UPDATED",
        description: "Your password has been changed successfully",
      });

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "PASSWORD UPDATE FAILED",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/profile"
            className="flex items-center text-steel hover:text-white mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Link>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
            {isCoach ? "OFFICER PROFILE" : "PROFILE SETTINGS"}
          </h1>
          <p className="text-sm text-muted-text">
            Update your profile information
          </p>
        </div>
        {isCoach && (
          <div className="rounded-sm border border-tactical-red bg-tactical-red/10 p-2">
            <Shield className="h-6 w-6 text-tactical-red" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-tactical-red" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-steel/30">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gunmetal">
                    <User className="h-16 w-16 text-steel" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <Label
                  htmlFor="avatar"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-sm bg-steel/20 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-steel/30 transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {previewUrl ? "Change Photo" : "Upload Photo"}
                    </>
                  )}
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <p className="text-xs text-steel">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-tactical-red" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gunmetal/50 border-steel/30 cursor-not-allowed"
              />
              <p className="text-xs text-steel">Email cannot be changed</p>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Change Password - Separate form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-tactical-red" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                  className="bg-gunmetal border-steel/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-white"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-steel">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                  className="bg-gunmetal border-steel/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={passwordLoading || !passwordData.newPassword || !passwordData.confirmPassword}
              className="w-full bg-tactical-red hover:bg-red-700"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Coach-Specific Fields */}
        {isCoach && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-tactical-red" />
                  Coach Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About You</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell your soldiers about yourself, your training philosophy, and what drives you..."
                    className="bg-gunmetal border-steel/30 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) =>
                      setFormData({ ...formData, specialties: e.target.value })
                    }
                    placeholder="e.g., Strength Training, Calisthenics, HIIT"
                    className="bg-gunmetal border-steel/30"
                  />
                  <p className="text-xs text-steel">
                    Comma-separated list of your training specialties
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications</Label>
                    <Input
                      id="certifications"
                      value={formData.certifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          certifications: e.target.value,
                        })
                      }
                      placeholder="e.g., NASM-CPT, CSCS"
                      className="bg-gunmetal border-steel/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.years_experience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          years_experience: e.target.value,
                        })
                      }
                      placeholder="Years coaching"
                      className="bg-gunmetal border-steel/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/profile")}
            className="flex-1 border-steel/30"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 bg-tactical-red hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
