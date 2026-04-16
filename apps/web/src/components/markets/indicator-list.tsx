import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatLabel,
  type ActiveIndicator,
  type IndicatorColor,
  type IndicatorSpec,
} from "@/lib/indicator-defaults";

function Swatch({ color, dim }: { color: IndicatorColor; dim?: boolean }) {
  const style = dim ? { opacity: 0.4 } : undefined;
  if (typeof color === "string") {
    return <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: color, ...style }} />;
  }
  if (color.kind === "macd") {
    return (
      <span className="flex h-3 w-5 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/3" style={{ backgroundColor: color.line }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.signal }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.hist }} />
      </span>
    );
  }
  if (color.kind === "stoch") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.k }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.d }} />
      </span>
    );
  }
  if (color.kind === "maCross") {
    return (
      <span className="flex h-3 w-5 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.fast }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.slow }} />
      </span>
    );
  }
  if (color.kind === "macdCross") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.bull }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.bear }} />
      </span>
    );
  }
  return (
    <span className="flex h-3 w-5 shrink-0 overflow-hidden rounded-sm" style={style}>
      <span className="h-full w-1/3" style={{ backgroundColor: color.adx }} />
      <span className="h-full w-1/3" style={{ backgroundColor: color.pdi }} />
      <span className="h-full w-1/3" style={{ backgroundColor: color.mdi }} />
    </span>
  );
}

export function IndicatorList({
  items,
  hiddenIds,
  onToggleHidden,
  onChange,
  onRemove,
}: {
  items: ActiveIndicator[];
  hiddenIds: Set<string>;
  onToggleHidden: (localId: string) => void;
  onChange: (localId: string, next: { spec: IndicatorSpec; color: IndicatorColor }) => void;
  onRemove: (localId: string) => void;
}) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-fg)]">{t("markets.noIndicators")}</p>
    );
  }

  const editingItem = items.find((it) => it.localId === editingId) ?? null;

  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => {
          const hidden = hiddenIds.has(it.localId);
          const label = formatLabel(it.spec);
          const toggleTitle = hidden ? t("markets.show") : t("markets.hide");
          return (
            <li
              key={it.localId}
              className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1"
            >
              <button
                type="button"
                onClick={() => onToggleHidden(it.localId)}
                title={toggleTitle}
                aria-pressed={!hidden}
                className="flex items-center gap-1.5 rounded px-1 py-0.5 text-sm hover:bg-[var(--color-accent)]"
              >
                <Swatch color={it.color} dim={hidden} />
                <span className={hidden ? "text-[var(--color-muted-fg)] line-through" : "font-medium"}>
                  {label}
                </span>
                {hidden ? (
                  <EyeOff className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" aria-hidden />
                ) : (
                  <Eye className="h-3.5 w-3.5 text-[var(--color-muted-fg)]" aria-hidden />
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditingId(it.localId)}
                title={t("markets.edit")}
                aria-label={t("markets.edit")}
                className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onRemove(it.localId)}
                title={t("markets.remove")}
                aria-label={t("markets.remove")}
                className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-destructive)]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      <Dialog
        open={editingItem !== null}
        onOpenChange={(o) => { if (!o) setEditingId(null); }}
        title={editingItem ? `${t("markets.edit")} — ${formatLabel(editingItem.spec)}` : ""}
      >
        {editingItem && (
          <EditForm
            item={editingItem}
            onApply={(next) => {
              onChange(editingItem.localId, next);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        )}
      </Dialog>
    </>
  );
}

function EditForm({
  item,
  onApply,
  onCancel,
}: {
  item: ActiveIndicator;
  onApply: (next: { spec: IndicatorSpec; color: IndicatorColor }) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [spec, setSpec] = useState<IndicatorSpec>(item.spec);
  const [color, setColor] = useState<IndicatorColor>(item.color);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onApply({ spec, color });
  }

  const isSinglePeriod =
    spec.kind === "sma" || spec.kind === "ema" || spec.kind === "rma" ||
    spec.kind === "wma" || spec.kind === "dema" || spec.kind === "rsi" ||
    spec.kind === "mom" || spec.kind === "roc" ||
    spec.kind === "atr" || spec.kind === "adx" ||
    spec.kind === "stochRsi" || spec.kind === "williamsR";

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {isSinglePeriod && (
          <NumberField
            label={t("markets.period")}
            value={spec.period}
            min={spec.kind === "mom" || spec.kind === "roc" ? 1 : 2}
            max={500}
            onChange={(v) => setSpec({ ...spec, period: v })}
          />
        )}
        {spec.kind === "macd" && (
          <>
            <NumberField label={t("markets.fast")} value={spec.fast} min={2} max={200}
              onChange={(v) => setSpec({ ...spec, fast: v })} />
            <NumberField label={t("markets.slow")} value={spec.slow} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, slow: v })} />
            <NumberField label={t("markets.signal")} value={spec.signal} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, signal: v })} />
          </>
        )}
        {spec.kind === "bbands" && (
          <>
            <NumberField label={t("markets.period")} value={spec.period} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, period: v })} />
            <NumberField label={t("markets.stdDev")} value={spec.stdDev} min={0.1} max={10} step={0.1}
              onChange={(v) => setSpec({ ...spec, stdDev: v })} />
          </>
        )}
        {spec.kind === "stoch" && (
          <>
            <NumberField label={t("markets.period")} value={spec.period} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, period: v })} />
            <NumberField label={t("markets.signal")} value={spec.signal} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, signal: v })} />
            <NumberField label={t("markets.smooth")} value={spec.smooth} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, smooth: v })} />
          </>
        )}
        {spec.kind === "psar" && (
          <>
            <NumberField label={t("markets.step")} value={spec.step} min={0.001} max={0.5} step={0.01}
              onChange={(v) => setSpec({ ...spec, step: v })} />
            <NumberField label={t("markets.max")} value={spec.max} min={0.01} max={1} step={0.01}
              onChange={(v) => setSpec({ ...spec, max: v })} />
          </>
        )}
        {spec.kind === "maCross" && (
          <>
            <NumberField label={t("markets.fast")} value={spec.fastPeriod} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, fastPeriod: v })} />
            <NumberField label={t("markets.slow")} value={spec.slowPeriod} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, slowPeriod: v })} />
            <div className="grid gap-1.5">
              <Label>{t("markets.maType")}</Label>
              <select
                value={spec.maType}
                onChange={(e) =>
                  setSpec({ ...spec, maType: e.target.value === "ema" ? "ema" : "sma" })
                }
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              >
                <option value="sma">SMA</option>
                <option value="ema">EMA</option>
              </select>
            </div>
          </>
        )}
        {spec.kind === "macdCross" && (
          <>
            <NumberField label={t("markets.fast")} value={spec.fast} min={2} max={200}
              onChange={(v) => setSpec({ ...spec, fast: v })} />
            <NumberField label={t("markets.slow")} value={spec.slow} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, slow: v })} />
            <NumberField label={t("markets.signal")} value={spec.signal} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, signal: v })} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {typeof color === "object" && color.kind === "macd" ? (
          <>
            <ColorField label={t("markets.colorLine")} value={color.line}
              onChange={(v) => setColor({ kind: "macd", line: v, signal: color.signal, hist: color.hist })} />
            <ColorField label={t("markets.colorSignal")} value={color.signal}
              onChange={(v) => setColor({ kind: "macd", line: color.line, signal: v, hist: color.hist })} />
            <ColorField label={t("markets.colorHist")} value={color.hist}
              onChange={(v) => setColor({ kind: "macd", line: color.line, signal: color.signal, hist: v })} />
          </>
        ) : typeof color === "object" && color.kind === "stoch" ? (
          <>
            <ColorField label={t("markets.colorK")} value={color.k}
              onChange={(v) => setColor({ kind: "stoch", k: v, d: color.d })} />
            <ColorField label={t("markets.colorD")} value={color.d}
              onChange={(v) => setColor({ kind: "stoch", k: color.k, d: v })} />
          </>
        ) : typeof color === "object" && color.kind === "adx" ? (
          <>
            <ColorField label={t("markets.colorAdx")} value={color.adx}
              onChange={(v) => setColor({ kind: "adx", adx: v, pdi: color.pdi, mdi: color.mdi })} />
            <ColorField label={t("markets.colorPdi")} value={color.pdi}
              onChange={(v) => setColor({ kind: "adx", adx: color.adx, pdi: v, mdi: color.mdi })} />
            <ColorField label={t("markets.colorMdi")} value={color.mdi}
              onChange={(v) => setColor({ kind: "adx", adx: color.adx, pdi: color.pdi, mdi: v })} />
          </>
        ) : typeof color === "object" && color.kind === "maCross" ? (
          <>
            <ColorField label={t("markets.colorFast")} value={color.fast}
              onChange={(v) => setColor({ ...color, fast: v })} />
            <ColorField label={t("markets.colorSlow")} value={color.slow}
              onChange={(v) => setColor({ ...color, slow: v })} />
            <ColorField label={t("markets.colorBull")} value={color.bull}
              onChange={(v) => setColor({ ...color, bull: v })} />
            <ColorField label={t("markets.colorBear")} value={color.bear}
              onChange={(v) => setColor({ ...color, bear: v })} />
          </>
        ) : typeof color === "object" && color.kind === "macdCross" ? (
          <>
            <ColorField label={t("markets.colorBull")} value={color.bull}
              onChange={(v) => setColor({ ...color, bull: v })} />
            <ColorField label={t("markets.colorBear")} value={color.bear}
              onChange={(v) => setColor({ ...color, bear: v })} />
          </>
        ) : (
          <ColorField
            label={t("markets.color")}
            value={typeof color === "string" ? color : "#2563eb"}
            onChange={(v) => setColor(v)}
          />
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {t("markets.cancel")}
        </Button>
        <Button type="submit" size="sm">
          {t("markets.apply")}
        </Button>
      </div>
    </form>
  );
}

function NumberField({
  label, value, min, max, step, onChange,
}: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
      />
    </div>
  );
}

function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer rounded-md border border-[var(--color-border)] bg-transparent"
      />
    </div>
  );
}
