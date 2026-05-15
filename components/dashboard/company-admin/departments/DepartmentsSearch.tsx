"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type DepartmentsSearchProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
};

export default function DepartmentsSearch({
  searchQuery,
  onSearchQueryChange,
}: DepartmentsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder="Search by department, host name, phone, or email..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="h-12 rounded-xl border-slate-100 bg-white pl-10 text-base shadow-sm focus-visible:ring-blue-600"
      />
    </div>
  );
}
