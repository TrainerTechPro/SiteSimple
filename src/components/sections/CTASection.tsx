import { CTAContent } from "@/types";

export default function CTASection({ content }: { content: CTAContent }) {
  return (
    <section className="py-16 px-6 bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto text-center">
        {content.headline && (
          <h2 className="text-3xl font-bold mb-6">{content.headline}</h2>
        )}
        {content.buttonText && (
          <a
            href={content.buttonLink || "#"}
            className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            {content.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
