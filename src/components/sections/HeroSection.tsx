import { HeroContent } from "@/types";

function sanitizeImageUrl(url: string): string {
  if (!url) return "";
  // Only allow relative upload paths or https URLs
  if (url.startsWith("/uploads/") || url.startsWith("https://")) {
    // Remove CSS injection characters
    return url.replace(/[;{}()'"\\]/g, "");
  }
  return "";
}

export default function HeroSection({ content }: { content: HeroContent }) {
  const safeImageUrl = sanitizeImageUrl(content.backgroundImage || "");
  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center text-white"
      style={{
        backgroundImage: safeImageUrl
          ? `url(${safeImageUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          {content.headline || "Welcome"}
        </h1>
        {content.subheadline && (
          <p className="text-lg md:text-xl text-gray-200 mb-8">
            {content.subheadline}
          </p>
        )}
        {content.ctaText && (
          <a
            href={content.ctaLink || "#"}
            className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            {content.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
