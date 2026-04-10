"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { createSite } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
      {pending ? "Creating..." : "Create Site"}
    </button>
  );
}

interface Client {
  id: string;
  name: string | null;
  email: string;
}

interface CreateSiteFormProps {
  clients: Client[];
  defaultOwnerId?: string;
}

export default function CreateSiteForm({ clients, defaultOwnerId }: CreateSiteFormProps) {
  const [state, formAction] = useFormState(createSite, null);

  return (
    <form
      action={formAction}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6"
    >
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="site-name" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Site Name
        </label>
        <input
          id="site-name"
          type="text"
          name="name"
          required
          placeholder="My Awesome Website"
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="site-slug" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 font-mono">/sites/</span>
          <input
            id="site-slug"
            type="text"
            name="slug"
            required
            placeholder="my-awesome-website"
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
            className="input-field flex-1"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Lowercase letters, numbers, and hyphens only
        </p>
      </div>

      <div>
        <label htmlFor="site-domain" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Domain (optional)
        </label>
        <input
          id="site-domain"
          type="text"
          name="domain"
          placeholder="www.example.com"
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="site-ownerId" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Owner
        </label>
        <select
          id="site-ownerId"
          name="ownerId"
          required
          defaultValue={defaultOwnerId || ""}
          className="input-field"
        >
          <option value="" disabled>
            Select a client...
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email})
            </option>
          ))}
        </select>
        {clients.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            No clients found.{" "}
            <Link href="/admin/clients" className="underline">
              Create a client first
            </Link>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton />
        <Link
          href="/admin/sites"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
