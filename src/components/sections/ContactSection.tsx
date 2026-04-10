import { ContactContent } from "@/types";

export default function ContactSection({
  content,
}: {
  content: ContactContent;
}) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
          Contact Us
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {content.phone && (
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Phone
                </p>
                <a
                  href={`tel:${content.phone}`}
                  className="text-lg text-gray-900 hover:text-amber-500"
                >
                  {content.phone}
                </a>
              </div>
            )}
            {content.email && (
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Email
                </p>
                <a
                  href={`mailto:${content.email}`}
                  className="text-lg text-gray-900 hover:text-amber-500"
                >
                  {content.email}
                </a>
              </div>
            )}
            {content.address && (
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Address
                </p>
                <p className="text-lg text-gray-900 whitespace-pre-wrap">
                  {content.address}
                </p>
              </div>
            )}
          </div>
          {content.showMap && content.address && (
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-gray-400" aria-hidden="true">
              <p className="text-sm">Map placeholder</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
