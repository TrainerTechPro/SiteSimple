"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SectionType } from "@prisma/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
} from "@/lib/actions";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type {
  HeroContent,
  TextContent,
  PricingContent,
  CTAContent,
  ContactContent,
  GalleryContent,
  PricingItem,
} from "@/types";

// ─── Types ───

interface SerializedSection {
  id: string;
  type: SectionType;
  order: number;
  content: Record<string, unknown>;
  pageId: string;
}

interface PageEditorProps {
  pageId: string;
  siteId: string;
  pageTitle: string;
  siteSlug: string;
  initialSections: SerializedSection[];
}

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  HERO: "Hero",
  TEXT: "Text",
  PRICING: "Pricing",
  CTA: "Call to Action",
  CONTACT: "Contact",
  GALLERY: "Gallery",
};

const SECTION_TYPE_COLORS: Record<SectionType, string> = {
  HERO: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  TEXT: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  PRICING: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  CTA: "bg-green-500/10 text-green-600 border-green-500/20",
  CONTACT: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  GALLERY: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

// ─── Upload Helper ───

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.path;
}

// ─── Main Component ───

export default function PageEditor({
  pageId,
  siteId,
  pageTitle,
  siteSlug,
  initialSections,
}: PageEditorProps) {
  const router = useRouter();
  const [sections, setSections] = useState<SerializedSection[]>(initialSections);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const [newType, setNewType] = useState<SectionType>("HERO");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [liveContent, setLiveContent] = useState<Record<string, Record<string, unknown>>>({});
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Scroll the preview panel to the section being edited
  useEffect(() => {
    if (editingId) {
      const el = document.getElementById(`preview-${editingId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editingId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ─── Add Section ───

  const handleAddSection = useCallback(async () => {
    setAdding(true);
    try {
      await addSection(pageId, newType);
      router.refresh();
    } catch {
      alert("Failed to add section");
    } finally {
      setAdding(false);
    }
  }, [pageId, newType, router]);

  // ─── Delete Section ───

  const handleDelete = useCallback(
    async (sectionId: string) => {
      if (!confirm("Delete this section?")) return;
      try {
        await deleteSection(sectionId);
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        if (editingId === sectionId) setEditingId(null);
      } catch {
        alert("Failed to delete section");
      }
    },
    [editingId]
  );

  // ─── Save Section ───

  const handleSave = useCallback(
    async (sectionId: string, content: Record<string, unknown>) => {
      setSaving(true);
      try {
        await updateSection(sectionId, content);
        setSections((prev) =>
          prev.map((s) => (s.id === sectionId ? { ...s, content } : s))
        );
        // Clear live content for this section since saved content is now canonical
        setLiveContent((prev) => {
          const next = { ...prev };
          delete next[sectionId];
          return next;
        });
        setEditingId(null);
      } catch {
        alert("Failed to save section");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // ─── Reorder ───

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);

      setSections(newOrder);

      try {
        await reorderSections(
          pageId,
          newOrder.map((s) => s.id)
        );
      } catch {
        setSections(sections);
        alert("Failed to reorder sections");
      }
    },
    [sections, pageId]
  );

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-400 font-mono mt-1">
            /sites/{siteSlug}/{pageId}
          </p>
        </div>
      </div>

      {/* Mobile tab toggle - only on small screens */}
      <div className="flex md:hidden mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "edit" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "preview" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
        >
          Preview
        </button>
      </div>

      {/* Split screen */}
      <div className="flex gap-6">
        {/* Left: Edit Panel */}
        <div className={`w-full md:w-[45%] flex-shrink-0 ${activeTab === "preview" ? "hidden md:block" : ""}`}>
          {/* Add Section Bar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex items-center gap-3">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-500 whitespace-nowrap">
              Add Section
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as SectionType)}
              aria-label="Add section type"
              className="input-field flex-1 max-w-xs"
            >
              {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddSection}
              disabled={adding}
              className="btn-primary disabled:opacity-50"
            >
              {adding ? "Adding..." : "+ Add"}
            </button>
          </div>

          {/* Sections List */}
          {sections.length === 0 ? (
            <div className="bg-white border border-gray-200 border-dashed rounded-xl p-12 text-center">
              <p className="text-gray-400 text-sm">
                No sections yet. Add your first section above.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sections.map((section) => (
                    <SortableSectionCard
                      key={section.id}
                      section={section}
                      isEditing={editingId === section.id}
                      isSaving={saving && editingId === section.id}
                      onToggleEdit={() =>
                        setEditingId(editingId === section.id ? null : section.id)
                      }
                      onSave={handleSave}
                      onDelete={handleDelete}
                      onContentChange={(id, content) =>
                        setLiveContent((prev) => ({ ...prev, [id]: content }))
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Right: Preview Panel */}
        <div className={`w-full md:w-[55%] ${activeTab === "edit" ? "hidden md:block" : ""}`}>
          <div className="sticky top-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Live Preview</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                </div>
              </div>
              <div className="max-h-[75vh] overflow-y-auto" id="preview-panel">
                {sections.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-sm">
                    Add sections to see a preview
                  </div>
                ) : (
                  sections.map((section) => (
                    <div
                      key={section.id}
                      id={`preview-${section.id}`}
                      className={`transition-all duration-200 ${editingId === section.id ? "ring-2 ring-amber-500 ring-inset" : ""}`}
                    >
                      <SectionRenderer
                        type={section.type}
                        content={(liveContent[section.id] || section.content) as Record<string, unknown>}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Section Card ───

interface SortableSectionCardProps {
  section: SerializedSection;
  isEditing: boolean;
  isSaving: boolean;
  onToggleEdit: () => void;
  onSave: (id: string, content: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onContentChange?: (id: string, content: Record<string, unknown>) => void;
}

function SortableSectionCard({
  section,
  isEditing,
  isSaving,
  onToggleEdit,
  onSave,
  onDelete,
  onContentChange,
}: SortableSectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>

        {/* Type Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border ${
            SECTION_TYPE_COLORS[section.type]
          }`}
        >
          {SECTION_TYPE_LABELS[section.type]}
        </span>

        {/* Order Number */}
        <span className="text-xs text-gray-300 font-mono">
          #{section.order + 1}
        </span>

        <div className="flex-1" />

        {/* Edit Toggle */}
        <button
          onClick={onToggleEdit}
          className={`text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-md transition-colors ${
            isEditing
              ? "bg-amber-50 text-amber-600"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          {isEditing ? "Close" : "Edit"}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(section.id)}
          className="text-gray-300 hover:text-red-500 transition-colors"
          title="Delete section"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="p-4 bg-gray-50">
          <SectionEditForm
            section={section}
            isSaving={isSaving}
            onSave={onSave}
            onContentChange={onContentChange}
          />
        </div>
      )}
    </div>
  );
}

// ─── Section Edit Form ───

interface SectionEditFormProps {
  section: SerializedSection;
  isSaving: boolean;
  onSave: (id: string, content: Record<string, unknown>) => Promise<void>;
  onContentChange?: (id: string, content: Record<string, unknown>) => void;
}

function SectionEditForm({ section, isSaving, onSave, onContentChange }: SectionEditFormProps) {
  const [content, setContent] = useState<Record<string, unknown>>(
    section.content
  );

  const updateField = (key: string, value: unknown) => {
    setContent((prev) => {
      const next = { ...prev, [key]: value };
      onContentChange?.(section.id, next);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(section.id, content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {section.type === "HERO" && (
        <HeroForm
          content={content as unknown as HeroContent}
          onChange={updateField}
        />
      )}
      {section.type === "TEXT" && (
        <TextForm
          content={content as unknown as TextContent}
          onChange={updateField}
        />
      )}
      {section.type === "PRICING" && (
        <PricingForm
          content={content as unknown as PricingContent}
          onChange={updateField}
        />
      )}
      {section.type === "CTA" && (
        <CTAForm
          content={content as unknown as CTAContent}
          onChange={updateField}
        />
      )}
      {section.type === "CONTACT" && (
        <ContactForm
          content={content as unknown as ContactContent}
          onChange={updateField}
        />
      )}
      {section.type === "GALLERY" && (
        <GalleryForm
          content={content as unknown as GalleryContent}
          onChange={updateField}
        />
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary disabled:opacity-50 text-sm"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ─── Field Helpers ───

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
      {children}
    </label>
  );
}

// ─── HERO Form ───

function HeroForm({
  content,
  onChange,
}: {
  content: HeroContent;
  onChange: (key: string, value: unknown) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadFile(file);
      onChange("backgroundImage", path);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input
          type="text"
          value={content.headline || ""}
          onChange={(e) => onChange("headline", e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <FieldLabel>Subheadline</FieldLabel>
        <input
          type="text"
          value={content.subheadline || ""}
          onChange={(e) => onChange("subheadline", e.target.value)}
          className="input-field"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>CTA Text</FieldLabel>
          <input
            type="text"
            value={content.ctaText || ""}
            onChange={(e) => onChange("ctaText", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <FieldLabel>CTA Link</FieldLabel>
          <input
            type="text"
            value={content.ctaLink || ""}
            onChange={(e) => onChange("ctaLink", e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <FieldLabel>Background Image</FieldLabel>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100"
          />
          {uploading && (
            <span className="text-xs text-gray-400">Uploading...</span>
          )}
        </div>
        {content.backgroundImage && (
          <div className="mt-2 relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.backgroundImage}
              alt="Background preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("backgroundImage", "")}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70"
            >
              x
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── TEXT Form ───

function TextForm({
  content,
  onChange,
}: {
  content: TextContent;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div>
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          value={content.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <FieldLabel>Body</FieldLabel>
        <textarea
          value={content.body || ""}
          onChange={(e) => onChange("body", e.target.value)}
          rows={5}
          className="input-field resize-y"
        />
      </div>
    </>
  );
}

// ─── PRICING Form ───

function PricingForm({
  content,
  onChange,
}: {
  content: PricingContent;
  onChange: (key: string, value: unknown) => void;
}) {
  const items: PricingItem[] = (content.items as PricingItem[]) || [];

  const updateItem = (index: number, field: keyof PricingItem, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange("items", updated);
  };

  const addItem = () => {
    onChange("items", [
      ...items,
      { name: "Plan Name", price: "$0", description: "Plan description" },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(
      "items",
      items.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <div>
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          value={content.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          className="input-field"
        />
      </div>
      <div>
        <FieldLabel>Pricing Items</FieldLabel>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs text-red-400 hover:text-red-600 font-mono"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="Plan name"
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="$29"
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="input-field text-sm"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          + Add pricing item
        </button>
      </div>
    </>
  );
}

// ─── CTA Form ───

function CTAForm({
  content,
  onChange,
}: {
  content: CTAContent;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input
          type="text"
          value={content.headline || ""}
          onChange={(e) => onChange("headline", e.target.value)}
          className="input-field"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Button Text</FieldLabel>
          <input
            type="text"
            value={content.buttonText || ""}
            onChange={(e) => onChange("buttonText", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <FieldLabel>Button Link</FieldLabel>
          <input
            type="text"
            value={content.buttonLink || ""}
            onChange={(e) => onChange("buttonLink", e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </>
  );
}

// ─── CONTACT Form ───

function ContactForm({
  content,
  onChange,
}: {
  content: ContactContent;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Phone</FieldLabel>
          <input
            type="text"
            value={content.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={content.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <FieldLabel>Address</FieldLabel>
        <textarea
          value={content.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
          rows={3}
          className="input-field resize-y"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showMap"
          checked={content.showMap ?? true}
          onChange={(e) => onChange("showMap", e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
        />
        <label htmlFor="showMap" className="text-sm text-gray-700">
          Show map embed
        </label>
      </div>
    </>
  );
}

// ─── GALLERY Form ───

function GalleryForm({
  content,
  onChange,
}: {
  content: GalleryContent;
  onChange: (key: string, value: unknown) => void;
}) {
  const images: string[] = (content.images as string[]) || [];
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newPaths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const path = await uploadFile(files[i]);
        newPaths.push(path);
      }
      onChange("images", [...images, ...newPaths]);
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    onChange(
      "images",
      images.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <div>
        <FieldLabel>Gallery Images</FieldLabel>
        <div className="grid grid-cols-4 gap-3 mb-3">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100"
          />
          {uploading && (
            <span className="text-xs text-gray-400">Uploading...</span>
          )}
        </div>
      </div>
    </>
  );
}
