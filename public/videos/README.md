# Intro Video Setup

## Required Files

Place the following files in the `public` directory:

### 1. Video File
- **Path**: `/public/videos/intro.mp4`
- **Recommended specs**:
  - Format: MP4 (H.264 codec)
  - Resolution: 1920x1080 (1080p) or 1280x720 (720p)
  - Duration: 30-90 seconds recommended
  - File size: Keep under 20MB for fast loading

### 2. Poster Image (Thumbnail)
- **Path**: `/public/images/intro-video-poster.jpg`
- **Recommended specs**:
  - Format: JPG or PNG
  - Resolution: Match video resolution (1920x1080 or 1280x720)
  - File size: Under 200KB

## Alternative: External Video Hosting

For better performance, consider hosting the video on:
- **Cloudflare Stream** - Best for performance
- **Vercel Blob** - If using Vercel
- **YouTube** (unlisted) - Free, but requires embedding changes
- **Vimeo** - Professional option

To use external hosting, modify the video source in:
`/components/gamification/intro-video-modal.tsx`

```tsx
<source src="https://your-cdn.com/intro.mp4" type="video/mp4" />
```

## Content Suggestions

The intro video should include:
1. Welcome message from the trainer
2. Brief overview of the app features
3. Motivational call-to-action
4. Military/tactical theme consistent with app branding

## Testing

Users see the intro video only once (on first login). To test again:
1. In Supabase, set `intro_video_watched` to `false` for your user
2. Or create a new test account
