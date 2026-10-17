import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { type Button } from "@/components/ui/button";

/**
 * DESIGN.md Section 5 — Pagination
 * 44px mono numbered squares.
 */
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Navigasi halaman"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1.5", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-none border-2 border-blue-900 font-mono text-[14px] font-medium tabular-nums cursor-pointer transition-colors",
        isActive
          ? "bg-blue-500 text-white shadow-[2px_2px_0_var(--blue-900)]"
          : "bg-white text-blue-900 hover:bg-blue-100",
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Halaman sebelumnya"
      size="default"
      className={cn("gap-1 px-3", className)}
      {...props}
    >
      <ChevronLeftIcon className="size-4 stroke-[1.75]" />
      <span className="hidden sm:block font-sans font-semibold">Sebelumnya</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Halaman berikutnya"
      size="default"
      className={cn("gap-1 px-3", className)}
      {...props}
    >
      <span className="hidden sm:block font-sans font-semibold">Berikutnya</span>
      <ChevronRightIcon className="size-4 stroke-[1.75]" />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex min-h-[44px] min-w-[44px] items-center justify-center font-mono text-slate-700",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">Halaman lainnya</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
