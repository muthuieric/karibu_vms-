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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
      <Input
        placeholder="Search by department, host name, phone, or email..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="pl-10 h-12 bg-white text-base shadow-sm border-zinc-300 focus-visible:ring-blue-600"
      />
    </div>
  );
}
