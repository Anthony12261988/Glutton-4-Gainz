# Intro Video Setup

## Supabase Storage Setup

The intro video is stored in Supabase Storage bucket called `videos`.

### 1. Run the Migration

First, run migration `035_videos_storage_bucket.sql` in Supabase Dashboard SQL Editor to create the bucket.

### 2. Upload Files

Upload the following files to the `videos` bucket:

| File          | Path in Bucket             | Specs                                    |
| ------------- | -------------------------- | ---------------------------------------- |
| Welcome Video | `intro/welcome.mp4`        | MP4 (H.264), 1080p or 720p, under 50MB   |
| Poster Image  | `intro/welcome-poster.jpg` | JPG, match video resolution, under 200KB |

### How to Upload

1. Go to Supabase Dashboard → Storage
2. Select the `videos` bucket
3. Create folder `intro`
4. Upload `welcome.mp4` and `welcome-poster.jpg`

## Video Specs

**Recommended video settings:**

- Format: MP4 (H.264 codec)
- Resolution: 1920x1080 (1080p) or 1280x720 (720p)
- Duration: 30-90 seconds
- File size: Under 50MB (bucket limit is 100MB)

**Poster image:**

- Format: JPG or PNG
- Resolution: Match video resolution
- File size: Under 200KB

## Content Suggestions

The intro video should include:

1. Welcome message from the trainer
2. Brief overview of the app features
3. Motivational call-to-action
4. Military/tactical theme consistent with app branding

## Error Handling

If no video is uploaded, the modal shows a friendly message and "Continue to Dashboard" button.

## Testing

Users see the intro video only once (on first login). To test again:

1. In Supabase, set `intro_video_watched` to `false` for your user
2. Or create a new test account

## Access Control

- **Upload/Edit/Delete**: Only admins and coaches
- **View**: Anyone (public read access)
