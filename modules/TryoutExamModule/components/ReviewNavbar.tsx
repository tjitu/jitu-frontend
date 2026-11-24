import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { getSubtestInfo } from "@/modules/TryoutDetailModule/components/subtest-meta";
import { FontSizeControl } from "./FontSizeControl";

interface Props {
  name: string;
  order: number;
  subtests: { name: string; order: number }[];
  fontSize: number;
  onBack: () => void;
  onSelect: (order: string) => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function ReviewNavbar({ name, order, subtests, fontSize, onBack, onSelect, onIncrease, onDecrease }: Props) {
  const current = subtests.findIndex(sub => Number(sub.order) === order);
  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <button type="button" aria-label="Kembali ke tryout" onClick={onBack}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-text hover:bg-surface-muted">
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 border-l border-border pl-2 sm:pl-4">
          <p className="text-xs font-medium text-text-muted">Subtes {current < 0 ? order : current + 1} dari {subtests.length}</p>
          <Select value={String(order)} onValueChange={onSelect}>
            <SelectTrigger aria-label={`Pilih subtes, saat ini ${name}`} className="h-auto max-w-full justify-start gap-1 border-0 px-0 py-0.5 font-semibold shadow-none data-[size=default]:h-auto">
              <span className="truncate">{name}</span>
            </SelectTrigger>
            <SelectContent position="popper">
              {subtests.map(sub => (
                <SelectItem key={sub.order} value={String(sub.order)}>
                  {getSubtestInfo(sub.name, Number(sub.order) - 1).name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <FontSizeControl fontSize={fontSize} onIncrease={onIncrease} onDecrease={onDecrease} />
    </>
  );
}
