"use client";

import { useState } from "react";
import { createClient } from "@/lib/actions";

export default function CreateClientForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const result = await createClient(null, formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect throws on success — this is expected
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {error && (
        <div role="alert" className="md:col-span-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="client-name" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Name
        </label>
        <input
          id="client-name"
          type="text"
          name="name"
          required
          placeholder="John Doe"
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="client-email" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Email
        </label>
        <input
          id="client-email"
          type="email"
          name="email"
          required
          placeholder="john@example.com"
          className="input-field"
        />
      </div>
      <div>
        <label htmlFor="client-password" className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Password
        </label>
        <input
          id="client-password"
          type="password"
          name="password"
          required
          placeholder="Minimum 8 characters"
          minLength={8}
          className="input-field"
        />
      </div>
      <div className="md:col-span-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Creating..." : "Create Client"}
        </button>
      </div>
    </form>
  );
}
