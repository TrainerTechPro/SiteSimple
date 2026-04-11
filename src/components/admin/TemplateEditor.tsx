"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { updateTemplateData } from "@/lib/actions";

interface TemplateEditorProps {
  siteId: string;
  siteName: string;
  siteSlug: string;
  initialData: Record<string, string>;
  previewUrl: string;
  backUrl: string;
}

// Group fields by prefix for better UX
function groupFields(data: Record<string, string>): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    "Site Meta": [],
    Hero: [],
    Courses: [],
    About: [],
    "Rate My Professors": [],
    Testimonials: [],
    Newsletter: [],
    Contact: [],
    Footer: [],
    Other: [],
  };

  for (const key of Object.keys(data).sort()) {
    if (key.startsWith("SITE_")) groups["Site Meta"].push(key);
    else if (key.startsWith("HERO_")) groups["Hero"].push(key);
    else if (key.startsWith("COURSE")) groups["Courses"].push(key);
    else if (key.startsWith("ABOUT_")) groups["About"].push(key);
    else if (key.startsWith("RMP_")) groups["Rate My Professors"].push(key);
    else if (key.startsWith("TESTIMONIAL")) groups["Testimonials"].push(key);
    else if (key.startsWith("NEWSLETTER_")) groups["Newsletter"].push(key);
    else if (key.startsWith("CONTACT_")) groups["Contact"].push(key);
    else if (key.startsWith("FOOTER_")) groups["Footer"].push(key);
    else groups["Other"].push(key);
  }

  // Remove empty groups
  for (const key of Object.keys(groups)) {
    if (groups[key].length === 0) delete groups[key];
  }

  return groups;
}

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function isLongText(key: string, value: string): boolean {
  return (
    value.length > 80 ||
    key.includes("DESC") ||
    key.includes("INTRO") ||
    key.includes("PARAGRAPH") ||
    key.includes("QUOTE") ||
    key.includes("BODY")
  );
}

export default function TemplateEditor({
  siteId,
  siteName,
  siteSlug,
  initialData,
  previewUrl,
  backUrl,
}: TemplateEditorProps) {
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [activeGroup, setActiveGroup] = useState<string>("Hero");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  const groups = useMemo(() => groupFields(data), [data]);
  const groupNames = Object.keys(groups);

  const updateField = useCallback((key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateTemplateData(siteId, data);
      setMessage({ type: "success", text: "Changes saved!" });
      // Reload preview iframe
      setIframeKey((k) => k + 1);
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  }, [siteId, data]);

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <a
            href={backUrl}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium inline-block mb-2"
          >
            ← Back
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Edit: {siteName}</h1>
          <p className="text-sm text-gray-500 font-mono">/{siteSlug}</p>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span
              className={`text-sm font-medium ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
              role="status"
            >
              {message.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Mobile tab toggle */}
      <div className="flex md:hidden mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "edit" ? "bg-white shadow text-gray-900" : "text-gray-500"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "preview" ? "bg-white shadow text-gray-900" : "text-gray-500"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Split screen */}
      <div className="flex gap-4">
        {/* Left: Edit Panel */}
        <div
          className={`w-full md:w-[45%] flex-shrink-0 ${
            activeTab === "preview" ? "hidden md:block" : ""
          }`}
        >
          {/* Group tabs */}
          <div className="flex flex-wrap gap-1 mb-4 bg-gray-50 border border-gray-200 rounded-lg p-1">
            {groupNames.map((group) => (
              <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                  activeGroup === group
                    ? "bg-white shadow text-amber-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Fields for active group */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {groups[activeGroup]?.map((key) => (
              <div key={key}>
                <label
                  htmlFor={`field-${key}`}
                  className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5"
                >
                  {humanizeKey(key)}
                </label>
                {isLongText(key, data[key] || "") ? (
                  <textarea
                    id={`field-${key}`}
                    value={data[key] || ""}
                    onChange={(e) => updateField(key, e.target.value)}
                    rows={4}
                    className="input-field resize-y text-sm"
                  />
                ) : (
                  <input
                    id={`field-${key}`}
                    type="text"
                    value={data[key] || ""}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="input-field text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Tip: Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600">Cmd/Ctrl + S</kbd> to save
          </p>
        </div>

        {/* Right: Preview Panel */}
        <div
          className={`w-full md:w-[55%] ${
            activeTab === "edit" ? "hidden md:block" : ""
          }`}
        >
          <div className="sticky top-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-500">
                  Live Preview
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="text-xs text-gray-500 hover:text-amber-600"
                    title="Refresh preview"
                  >
                    ↻ Refresh
                  </button>
                  <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-400" aria-hidden="true"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true"></span>
                  </div>
                </div>
              </div>
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-[80vh] border-0 bg-white"
                title={`Preview of ${siteName}`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Preview updates after saving. Click Refresh or Save to reload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
