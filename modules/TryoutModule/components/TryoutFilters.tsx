import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TryoutStatusFilter = "all" | "registered" | "not-registered";
export type TryoutSortOrder = "newest" | "oldest";

interface TryoutFiltersProps {
  activeTab: TryoutStatusFilter;
  onTabChange: (tab: TryoutStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOrder: TryoutSortOrder;
  onSortChange: (order: TryoutSortOrder) => void;
}

const STATUS_FILTERS: { id: TryoutStatusFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "registered", label: "Terdaftar" },
  { id: "not-registered", label: "Belum terdaftar" },
];

// Explicitly pair the trigger and panel across streamed SSR and hydration.
const SORT_CONTENT_ID = "tryout-sort-options";

export function TryoutFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
}: TryoutFiltersProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-4 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
      <div
        role="tablist"
        aria-label="Filter status pendaftaran"
        className="inline-flex rounded-md border border-border bg-surface-muted p-1 gap-1"
      >
        {STATUS_FILTERS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[34px] px-3.5 py-1.5 rounded-sm text-[13px] font-medium transition-colors duration-[120ms] cursor-pointer ${
                active
                  ? "bg-surface text-text border border-border font-semibold"
                  : "border border-transparent text-text-muted hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[1.75] text-text-muted" />
          <Input
            aria-label="Cari nama tryout"
            placeholder="Cari nama tryout…"
            className="pl-10"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <Select
          value={sortOrder}
          onValueChange={(value) => {
            if (value === "newest" || value === "oldest") onSortChange(value);
          }}
        >
          <SelectTrigger
            aria-label="Urutkan tryout"
            aria-controls={SORT_CONTENT_ID}
            className="w-full sm:w-[150px]"
          >
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent id={SORT_CONTENT_ID}>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
