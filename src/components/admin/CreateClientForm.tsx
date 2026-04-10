"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createClient } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
      {pending ? "Creating..." : "Create Client"}
    </button>
  );
}

export default function CreateClientForm() {
  const [state, formAction] = useFormState(createClient, null);

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {state?.error && (
        <div className="md:col-span-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Name
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="John Doe"
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="john@example.com"
          className="input-field"
        />
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          placeholder="Minimum 8 characters"
          minLength={8}
          className="input-field"
        />
      </div>
      <div className="md:col-span-3">
        <SubmitButton />
      </div>
    </form>
  );
}
