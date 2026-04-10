import { PricingContent } from "@/types";

export default function PricingSection({
  content,
}: {
  content: PricingContent;
}) {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-900">
            {content.title}
          </h2>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(content.items || []).map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.name}
              </h3>
              <p className="text-2xl font-bold text-amber-500 mb-3">
                {item.price}
              </p>
              {item.description && (
                <p className="text-gray-500 text-sm">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
