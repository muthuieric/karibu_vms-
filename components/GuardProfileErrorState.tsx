"use client";

export default function GuardProfileErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-red-600 font-medium">
        Error: Could not load guard profile. Are you logged in?
      </p>
    </div>
  );
}
