import { GalleryContent } from "@/types";

export default function GallerySection({
  content,
}: {
  content: GalleryContent;
}) {
  const images = content.images || [];

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl overflow-hidden bg-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Gallery image ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
