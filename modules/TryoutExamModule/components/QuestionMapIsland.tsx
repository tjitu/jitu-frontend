import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Grid2X2 } from "lucide-react";
import styles from "./question-map-island.module.css";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answered: number;
  total: number;
  children: ReactNode;
}

export function QuestionMapIsland({ open, onOpenChange, answered, total, children }: Props) {
  return (
    <div className="relative justify-self-center">
      <Dialog.Root modal={false} open={open} onOpenChange={onOpenChange}>
        <Dialog.Trigger className="flex h-11 items-center gap-2 rounded-full border border-primary/25 bg-blue-50 px-3 text-sm font-semibold text-primary shadow-xs transition-colors hover:bg-blue-100 sm:px-4 focus-visible:outline-primary">
          <Grid2X2 aria-hidden className="size-4" /> Peta soal
        </Dialog.Trigger>
        <Dialog.Content className={styles.panel}>
          <header className="flex items-center gap-3 border-b border-border px-5 py-4">
            <Grid2X2 aria-hidden className="size-5 text-primary" />
            <div className="flex-1">
              <Dialog.Title className="text-base font-bold text-text">Peta soal</Dialog.Title>
              <Dialog.Description className="text-xs text-text-muted">{answered} dari {total} soal dijawab</Dialog.Description>
            </div>
            <Dialog.Close aria-label="Tutup peta soal" className="grid size-9 place-items-center rounded-full bg-surface-muted text-text hover:bg-ink-100">
              <ChevronDown aria-hidden className="size-4" />
            </Dialog.Close>
          </header>
          <div className="min-h-0 overflow-y-auto overscroll-contain p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
