"use client";

interface ConfirmDeleteButtonProps {
  action: () => Promise<void>;
  message?: string;
  label?: string;
  className?: string;
}

export default function ConfirmDeleteButton({
  action,
  message = "Are you sure? This cannot be undone.",
  label = "Delete",
  className = "text-xs text-gray-400 hover:text-red-600 font-mono uppercase tracking-wider",
}: ConfirmDeleteButtonProps) {
  return (
    <form
      action={async () => {
        if (confirm(message)) {
          await action();
        }
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
