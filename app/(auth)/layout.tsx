export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      {/* Watermark Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div 
          className="absolute inset-0 z-[1] opacity-[0.15] bg-repeat-y bg-top bg-contain"
          style={{
            backgroundImage: 'url(/branding/IMG_5618.PNG)',
          }}
        />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
