import { TextContent } from "@/types";

export default function TextSection({ content }: { content: TextContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {content.title && (
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            {content.title}
          </h2>
        )}
        {content.body && (
          <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
            {content.body}
          </div>
        )}
      </div>
    </section>
  );
}
