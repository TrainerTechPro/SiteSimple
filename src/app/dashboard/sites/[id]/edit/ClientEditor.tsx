"use client";

import { useState, useCallback } from "react";
import { updateSection } from "@/lib/actions";
import type { SectionType } from "@prisma/client";
import type {
  HeroContent,
  TextContent,
  PricingContent,
  CTAContent,
  ContactContent,
  GalleryContent,
  PricingItem,
} from "@/types";

const SECTION_LABELS: Record<SectionType, string> = {
  HERO: "Hero Banner",
  TEXT: "Text Block",
  PRICING: "Pricing Menu",
  CTA: "Call to Action",
  CONTACT: "Contact Info",
  GALLERY: "Photo Gallery",
};

interface ClientEditorProps {
  sectionId: string;
  sectionType: SectionType;
  initialContent: Record<string, unknown>;
}

export default function ClientEditor({
  sectionId,
  sectionType,
  initialContent,
}: ClientEditorProps) {
  const [content, setContent] = useState<Record<string, unknown>>(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateSection(sectionId, content);
      setMessage({ type: "success", text: "Changes saved!" });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }, [sectionId, content]);

  const updateField = useCallback((field: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {SECTION_LABELS[sectionType]}
        </h3>
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {sectionType}
        </span>
      </div>

      <div className="space-y-5">
        {sectionType === "HERO" && (
          <HeroEditor
            content={content as unknown as HeroContent}
            onChange={updateField}
          />
        )}
        {sectionType === "TEXT" && (
          <TextEditor
            content={content as unknown as TextContent}
            onChange={updateField}
          />
        )}
        {sectionType === "PRICING" && (
          <PricingEditor
            content={content as unknown as PricingContent}
            onChange={updateField}
          />
        )}
        {sectionType === "CTA" && (
          <CTAEditor
            content={content as unknown as CTAContent}
            onChange={updateField}
          />
        )}
        {sectionType === "CONTACT" && (
          <ContactEditor
            content={content as unknown as ContactContent}
            onChange={updateField}
          />
        )}
        {sectionType === "GALLERY" && (
          <GalleryEditor
            content={content as unknown as GalleryContent}
            onChange={updateField}
          />
        )}
      </div>

      {/* Save button and message */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <span
            className={`text-sm font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Field Components ─── */

function FieldLabel({ label, hint, htmlFor }: { label: string; hint?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {hint && <span className="text-xs text-gray-400 ml-2">{hint}</span>}
    </label>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (val: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <FieldLabel label={label} hint={hint} htmlFor={fieldId} />
      {multiline ? (
        <textarea
          id={fieldId}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="input-field mt-1 resize-y"
        />
      ) : (
        <input
          id={fieldId}
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-field mt-1"
        />
      )}
    </div>
  );
}

function ImageUpload({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.path) {
        onChange(data.path);
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="mt-1 flex items-center gap-4">
        {value && (
          <img
            src={value}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
          />
        )}
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {uploading ? "Uploading..." : value ? "Change Image" : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Section Editors ─── */

function HeroEditor({
  content,
  onChange,
}: {
  content: HeroContent;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <>
      <TextField
        label="Main Headline"
        hint="The big text visitors see first"
        value={content.headline}
        onChange={(val) => onChange("headline", val)}
        placeholder="Welcome to Our Business"
      />
      <TextField
        label="Subheadline"
        hint="A short supporting message"
        value={content.subheadline}
        onChange={(val) => onChange("subheadline", val)}
        placeholder="We provide the best services for you"
      />
      <TextField
        label="Button Text"
        hint="Text on the main button"
        value={content.ctaText}
        onChange={(val) => onChange("ctaText", val)}
        placeholder="Get Started"
      />
      <TextField
        label="Button Link"
        hint="Where the button goes (e.g. #contact or a URL)"
        value={content.ctaLink}
        onChange={(val) => onChange("ctaLink", val)}
        placeholder="#contact"
      />
      <ImageUpload
        label="Background Image"
        hint="A wide banner image works best"
        value={content.backgroundImage}
        onChange={(val) => onChange("backgroundImage", val)}
      />
    </>
  );
}

function TextEditor({
  content,
  onChange,
}: {
  content: TextContent;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <>
      <TextField
        label="Section Title"
        value={content.title}
        onChange={(val) => onChange("title", val)}
        placeholder="About Us"
      />
      <TextField
        label="Content"
        hint="Write as much as you like"
        value={content.body}
        onChange={(val) => onChange("body", val)}
        multiline
        placeholder="Tell your story here..."
      />
    </>
  );
}

function PricingEditor({
  content,
  onChange,
}: {
  content: PricingContent;
  onChange: (field: string, value: unknown) => void;
}) {
  const items: PricingItem[] = content.items || [];

  function updateItem(index: number, field: keyof PricingItem, value: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange("items", updated);
  }

  function addItem() {
    onChange("items", [
      ...items,
      { name: "", price: "", description: "" },
    ]);
  }

  function removeItem(index: number) {
    onChange("items", items.filter((_, i) => i !== index));
  }

  return (
    <>
      <TextField
        label="Section Title"
        value={content.title}
        onChange={(val) => onChange("title", val)}
        placeholder="Our Pricing"
      />

      <div>
        <FieldLabel label="Menu / Price Items" />
        <div className="mt-2 space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">
                  Item {index + 1}
                </span>
                <button
                  onClick={() => removeItem(index)}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="Item name"
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="Price (e.g. $29)"
                  className="input-field text-sm"
                />
              </div>
              <input
                type="text"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, "description", e.target.value)
                }
                placeholder="Short description"
                className="input-field text-sm mt-3"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          <span className="text-lg leading-none">+</span> Add Item
        </button>
      </div>
    </>
  );
}

function CTAEditor({
  content,
  onChange,
}: {
  content: CTAContent;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <>
      <TextField
        label="Headline"
        hint="A short call to action"
        value={content.headline}
        onChange={(val) => onChange("headline", val)}
        placeholder="Ready to get started?"
      />
      <TextField
        label="Button Text"
        value={content.buttonText}
        onChange={(val) => onChange("buttonText", val)}
        placeholder="Contact Us"
      />
      <TextField
        label="Button Link"
        hint="Where the button goes"
        value={content.buttonLink}
        onChange={(val) => onChange("buttonLink", val)}
        placeholder="#contact"
      />
    </>
  );
}

function ContactEditor({
  content,
  onChange,
}: {
  content: ContactContent;
  onChange: (field: string, value: unknown) => void;
}) {
  return (
    <>
      <TextField
        label="Phone Number"
        value={content.phone}
        onChange={(val) => onChange("phone", val)}
        placeholder="(555) 123-4567"
      />
      <TextField
        label="Email Address"
        value={content.email}
        onChange={(val) => onChange("email", val)}
        placeholder="hello@yourbusiness.com"
      />
      <TextField
        label="Street Address"
        hint="Include city, state, and zip"
        value={content.address}
        onChange={(val) => onChange("address", val)}
        multiline
        placeholder="123 Main Street&#10;Anytown, USA 12345"
      />
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!content.showMap}
            onChange={(e) => onChange("showMap", e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Show Map
            </span>
            <p className="text-xs text-gray-400">
              Display a map of your location on the website
            </p>
          </div>
        </label>
      </div>
    </>
  );
}

function GalleryEditor({
  content,
  onChange,
}: {
  content: GalleryContent;
  onChange: (field: string, value: unknown) => void;
}) {
  const images: string[] = content.images || [];
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.path) {
          newImages.push(data.path);
        }
      }
      onChange("images", newImages);
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
      // Reset the input
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    onChange("images", images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <FieldLabel label="Photos" hint="Upload images of your business, products, or team" />

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-28 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        {uploading ? "Uploading..." : "Upload Photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {images.length === 0 && (
        <p className="mt-2 text-sm text-gray-400">
          No photos yet. Upload some to showcase your business.
        </p>
      )}
    </div>
  );
}
