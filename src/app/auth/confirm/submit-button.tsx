"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 disabled:bg-green-700/60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
    >
      {pending ? "מתחבר..." : "המשך לחשבון"}
    </button>
  );
}
