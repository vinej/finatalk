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
  if (color.kind === "keltner" || color.kind === "donchian") {
    return (
      <span className="flex h-3 w-5 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/3" style={{ backgroundColor: color.upper }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.middle }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.lower }} />
      </span>
    );
  }
  if (color.kind === "aroon") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.up }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.down }} />
      </span>
    );
  }
  if (color.kind === "vortex") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.plus }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.minus }} />
      </span>
    );
  }
  if (color.kind === "liqSweep") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.highSweep }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.lowSweep }} />
      </span>
    );
  }
  if (color.kind === "fvg") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.bullish }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.bearish }} />
      </span>
    );
  }
  if (color.kind === "srLevels") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.support }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.resistance }} />
      </span>
    );
  }
  if (color.kind === "pivots") {
    return (
      <span className="flex h-3 w-5 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/3" style={{ backgroundColor: color.support }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.pp }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.resistance }} />
      </span>
    );
  }
  if (color.kind === "volProfile") {
    return (
      <span className="flex h-3 w-5 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/3" style={{ backgroundColor: color.histogram }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.valueArea }} />
        <span className="h-full w-1/3" style={{ backgroundColor: color.poc }} />
      </span>
    );
  }
  if (color.kind === "orderBlock") {
    return (
      <span className="flex h-3 w-4 shrink-0 overflow-hidden rounded-sm" style={style}>
        <span className="h-full w-1/2" style={{ backgroundColor: color.bullish }} />
        <span className="h-full w-1/2" style={{ backgroundColor: color.bearish }} />
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
      <p className="text-sm text-[var(--color-muted-fg)]">{t("analysis.noIndicators")}</p>
    );
  }

  const editingItem = items.find((it) => it.localId === editingId) ?? null;

  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {items.map((it) => {
          const hidden = hiddenIds.has(it.localId);
          const label = formatLabel(it.spec);
          const toggleTitle = hidden ? t("analysis.show") : t("analysis.hide");
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
                title={t("analysis.edit")}
                aria-label={t("analysis.edit")}
                className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onRemove(it.localId)}
                title={t("analysis.remove")}
                aria-label={t("analysis.remove")}
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
        title={editingItem ? `${t("analysis.edit")} — ${formatLabel(editingItem.spec)}` : ""}
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
    spec.kind === "stochRsi" || spec.kind === "williamsR" ||
    spec.kind === "donchian" || spec.kind === "cmf" ||
    spec.kind === "aroon" || spec.kind === "vortex" ||
    spec.kind === "zscore";

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {isSinglePeriod && (
          <NumberField
            label={t("analysis.period")}
            value={spec.period}
            min={spec.kind === "mom" || spec.kind === "roc" ? 1 : 2}
            max={500}
            onChange={(v) => setSpec({ ...spec, period: v })}
          />
        )}
        {spec.kind === "macd" && (
          <>
            <NumberField label={t("analysis.fast")} value={spec.fast} min={2} max={200}
              onChange={(v) => setSpec({ ...spec, fast: v })} />
            <NumberField label={t("analysis.slow")} value={spec.slow} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, slow: v })} />
            <NumberField label={t("analysis.signal")} value={spec.signal} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, signal: v })} />
          </>
        )}
        {spec.kind === "bbands" && (
          <>
            <NumberField label={t("analysis.period")} value={spec.period} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, period: v })} />
            <NumberField label={t("analysis.stdDev")} value={spec.stdDev} min={0.1} max={10} step={0.1}
              onChange={(v) => setSpec({ ...spec, stdDev: v })} />
          </>
        )}
        {spec.kind === "stoch" && (
          <>
            <NumberField label={t("analysis.period")} value={spec.period} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, period: v })} />
            <NumberField label={t("analysis.signal")} value={spec.signal} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, signal: v })} />
            <NumberField label={t("analysis.smooth")} value={spec.smooth} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, smooth: v })} />
          </>
        )}
        {spec.kind === "psar" && (
          <>
            <NumberField label={t("analysis.step")} value={spec.step} min={0.001} max={0.5} step={0.01}
              onChange={(v) => setSpec({ ...spec, step: v })} />
            <NumberField label={t("analysis.max")} value={spec.max} min={0.01} max={1} step={0.01}
              onChange={(v) => setSpec({ ...spec, max: v })} />
          </>
        )}
        {spec.kind === "maCross" && (
          <>
            <NumberField label={t("analysis.fast")} value={spec.fastPeriod} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, fastPeriod: v })} />
            <NumberField label={t("analysis.slow")} value={spec.slowPeriod} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, slowPeriod: v })} />
            <div className="grid gap-1.5">
              <Label>{t("analysis.maType")}</Label>
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
            <NumberField label={t("analysis.fast")} value={spec.fast} min={2} max={200}
              onChange={(v) => setSpec({ ...spec, fast: v })} />
            <NumberField label={t("analysis.slow")} value={spec.slow} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, slow: v })} />
            <NumberField label={t("analysis.signal")} value={spec.signal} min={1} max={200}
              onChange={(v) => setSpec({ ...spec, signal: v })} />
          </>
        )}
        {spec.kind === "fib" && (
          <NumberField
            label={t("analysis.lookback")}
            value={spec.lookback ?? 0}
            min={0}
            max={2000}
            onChange={(v) => setSpec({ kind: "fib", ...(v >= 10 ? { lookback: v } : {}) })}
          />
        )}
        {spec.kind === "keltner" && (
          <>
            <NumberField label={t("analysis.period")} value={spec.period} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, period: v })} />
            <NumberField label={t("analysis.atrPeriod")} value={spec.atrPeriod} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, atrPeriod: v })} />
            <NumberField label={t("analysis.multiplier")} value={spec.multiplier} min={0.1} max={10} step={0.1}
              onChange={(v) => setSpec({ ...spec, multiplier: v })} />
          </>
        )}
        {spec.kind === "chaikinVol" && (
          <>
            <NumberField label={t("analysis.emaPeriod")} value={spec.emaPeriod} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, emaPeriod: v })} />
            <NumberField label={t("analysis.rocPeriod")} value={spec.rocPeriod} min={1} max={500}
              onChange={(v) => setSpec({ ...spec, rocPeriod: v })} />
          </>
        )}
        {spec.kind === "volOsc" && (
          <>
            <NumberField label={t("analysis.fast")} value={spec.fast} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, fast: v })} />
            <NumberField label={t("analysis.slow")} value={spec.slow} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, slow: v })} />
          </>
        )}
        {spec.kind === "tii" && (
          <>
            <NumberField label={t("analysis.majorPeriod")} value={spec.majorPeriod} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, majorPeriod: v })} />
            <NumberField label={t("analysis.minorPeriod")} value={spec.minorPeriod} min={1} max={500}
              onChange={(v) => setSpec({ ...spec, minorPeriod: v })} />
          </>
        )}
        {spec.kind === "bbPctB" && (
          <>
            <NumberField label={t("analysis.period")} value={spec.period} min={2} max={500}
              onChange={(v) => setSpec({ ...spec, period: v })} />
            <NumberField label={t("analysis.stdDev")} value={spec.stdDev} min={0.1} max={10} step={0.1}
              onChange={(v) => setSpec({ ...spec, stdDev: v })} />
          </>
        )}
        {spec.kind === "hurst" && (
          <NumberField label={t("analysis.period")} value={spec.period} min={20} max={2000}
            onChange={(v) => setSpec({ ...spec, period: v })} />
        )}
        {spec.kind === "liqSweep" && (
          <NumberField label={t("analysis.lookback")} value={spec.lookback} min={3} max={200}
            onChange={(v) => setSpec({ ...spec, lookback: v })} />
        )}
        {spec.kind === "fvg" && (
          <>
            <NumberField label={t("analysis.lookback")} value={spec.lookback} min={10} max={2000}
              onChange={(v) => setSpec({ ...spec, lookback: v })} />
            <div className="grid gap-1.5">
              <Label>{t("analysis.showFilled")}</Label>
              <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm">
                <input
                  type="checkbox"
                  checked={spec.showFilled}
                  onChange={(e) => setSpec({ ...spec, showFilled: e.target.checked })}
                />
                <span className="text-[var(--color-muted-foreground)]">{t("analysis.showFilledHint")}</span>
              </label>
            </div>
          </>
        )}
        {spec.kind === "srLevels" && (
          <>
            <NumberField label={t("analysis.lookback")} value={spec.lookback} min={30} max={5000}
              onChange={(v) => setSpec({ ...spec, lookback: v })} />
            <NumberField label={t("analysis.strength")} value={spec.strength} min={1} max={20}
              onChange={(v) => setSpec({ ...spec, strength: v })} />
            <NumberField label={t("analysis.tolerancePct")} value={spec.tolerancePct} min={0.05} max={5} step={0.05}
              onChange={(v) => setSpec({ ...spec, tolerancePct: v })} />
            <NumberField label={t("analysis.maxLevels")} value={spec.maxLevels} min={2} max={30}
              onChange={(v) => setSpec({ ...spec, maxLevels: v })} />
          </>
        )}
        {spec.kind === "pivots" && (
          <>
            <div className="grid gap-1.5">
              <Label>{t("analysis.pivotMethod")}</Label>
              <select
                value={spec.method}
                onChange={(e) =>
                  setSpec({ ...spec, method: e.target.value as "classic" | "fib" | "camarilla" })
                }
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              >
                <option value="classic">{t("analysis.pivotClassic")}</option>
                <option value="fib">{t("analysis.pivotFib")}</option>
                <option value="camarilla">{t("analysis.pivotCamarilla")}</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>{t("analysis.pivotTimeframe")}</Label>
              <select
                value={spec.timeframe}
                onChange={(e) =>
                  setSpec({ ...spec, timeframe: e.target.value as "weekly" | "monthly" })
                }
                className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
              >
                <option value="weekly">{t("analysis.pivotWeekly")}</option>
                <option value="monthly">{t("analysis.pivotMonthly")}</option>
              </select>
            </div>
          </>
        )}
        {spec.kind === "volProfile" && (
          <>
            <NumberField label={t("analysis.lookback")} value={spec.lookback} min={20} max={5000}
              onChange={(v) => setSpec({ ...spec, lookback: v })} />
            <NumberField label={t("analysis.bins")} value={spec.bins} min={10} max={200}
              onChange={(v) => setSpec({ ...spec, bins: v })} />
            <NumberField label={t("analysis.valueAreaPct")} value={spec.valueAreaPct} min={0.5} max={0.95} step={0.05}
              onChange={(v) => setSpec({ ...spec, valueAreaPct: v })} />
            <div className="grid gap-1.5">
              <Label>{t("analysis.showHistogram")}</Label>
              <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm">
                <input
                  type="checkbox"
                  checked={spec.showHistogram}
                  onChange={(e) => setSpec({ ...spec, showHistogram: e.target.checked })}
                />
                <span className="text-[var(--color-muted-foreground)]">{t("analysis.showHistogramHint")}</span>
              </label>
            </div>
          </>
        )}
        {spec.kind === "orderBlock" && (
          <>
            <NumberField label={t("analysis.lookback")} value={spec.lookback} min={20} max={2000}
              onChange={(v) => setSpec({ ...spec, lookback: v })} />
            <NumberField label={t("analysis.impulsePct")} value={spec.impulsePct} min={0.5} max={20} step={0.1}
              onChange={(v) => setSpec({ ...spec, impulsePct: v })} />
            <div className="grid gap-1.5">
              <Label>{t("analysis.showMitigated")}</Label>
              <label className="flex h-10 items-center gap-2 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm">
                <input
                  type="checkbox"
                  checked={spec.showMitigated}
                  onChange={(e) => setSpec({ ...spec, showMitigated: e.target.checked })}
                />
                <span className="text-[var(--color-muted-foreground)]">{t("analysis.showMitigatedHint")}</span>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {typeof color === "object" && color.kind === "macd" ? (
          <>
            <ColorField label={t("analysis.colorLine")} value={color.line}
              onChange={(v) => setColor({ kind: "macd", line: v, signal: color.signal, hist: color.hist })} />
            <ColorField label={t("analysis.colorSignal")} value={color.signal}
              onChange={(v) => setColor({ kind: "macd", line: color.line, signal: v, hist: color.hist })} />
            <ColorField label={t("analysis.colorHist")} value={color.hist}
              onChange={(v) => setColor({ kind: "macd", line: color.line, signal: color.signal, hist: v })} />
          </>
        ) : typeof color === "object" && color.kind === "stoch" ? (
          <>
            <ColorField label={t("analysis.colorK")} value={color.k}
              onChange={(v) => setColor({ kind: "stoch", k: v, d: color.d })} />
            <ColorField label={t("analysis.colorD")} value={color.d}
              onChange={(v) => setColor({ kind: "stoch", k: color.k, d: v })} />
          </>
        ) : typeof color === "object" && color.kind === "adx" ? (
          <>
            <ColorField label={t("analysis.colorAdx")} value={color.adx}
              onChange={(v) => setColor({ kind: "adx", adx: v, pdi: color.pdi, mdi: color.mdi })} />
            <ColorField label={t("analysis.colorPdi")} value={color.pdi}
              onChange={(v) => setColor({ kind: "adx", adx: color.adx, pdi: v, mdi: color.mdi })} />
            <ColorField label={t("analysis.colorMdi")} value={color.mdi}
              onChange={(v) => setColor({ kind: "adx", adx: color.adx, pdi: color.pdi, mdi: v })} />
          </>
        ) : typeof color === "object" && color.kind === "maCross" ? (
          <>
            <ColorField label={t("analysis.colorFast")} value={color.fast}
              onChange={(v) => setColor({ ...color, fast: v })} />
            <ColorField label={t("analysis.colorSlow")} value={color.slow}
              onChange={(v) => setColor({ ...color, slow: v })} />
            <ColorField label={t("analysis.colorBull")} value={color.bull}
              onChange={(v) => setColor({ ...color, bull: v })} />
            <ColorField label={t("analysis.colorBear")} value={color.bear}
              onChange={(v) => setColor({ ...color, bear: v })} />
          </>
        ) : typeof color === "object" && color.kind === "macdCross" ? (
          <>
            <ColorField label={t("analysis.colorBull")} value={color.bull}
              onChange={(v) => setColor({ ...color, bull: v })} />
            <ColorField label={t("analysis.colorBear")} value={color.bear}
              onChange={(v) => setColor({ ...color, bear: v })} />
          </>
        ) : typeof color === "object" && (color.kind === "keltner" || color.kind === "donchian") ? (
          <>
            <ColorField label={t("analysis.colorUpper")} value={color.upper}
              onChange={(v) => setColor({ ...color, upper: v })} />
            <ColorField label={t("analysis.colorMiddle")} value={color.middle}
              onChange={(v) => setColor({ ...color, middle: v })} />
            <ColorField label={t("analysis.colorLower")} value={color.lower}
              onChange={(v) => setColor({ ...color, lower: v })} />
          </>
        ) : typeof color === "object" && color.kind === "aroon" ? (
          <>
            <ColorField label={t("analysis.colorUp")} value={color.up}
              onChange={(v) => setColor({ kind: "aroon", up: v, down: color.down })} />
            <ColorField label={t("analysis.colorDown")} value={color.down}
              onChange={(v) => setColor({ kind: "aroon", up: color.up, down: v })} />
          </>
        ) : typeof color === "object" && color.kind === "vortex" ? (
          <>
            <ColorField label={t("analysis.colorPlus")} value={color.plus}
              onChange={(v) => setColor({ kind: "vortex", plus: v, minus: color.minus })} />
            <ColorField label={t("analysis.colorMinus")} value={color.minus}
              onChange={(v) => setColor({ kind: "vortex", plus: color.plus, minus: v })} />
          </>
        ) : typeof color === "object" && color.kind === "liqSweep" ? (
          <>
            <ColorField label={t("analysis.colorHighSweep")} value={color.highSweep}
              onChange={(v) => setColor({ kind: "liqSweep", highSweep: v, lowSweep: color.lowSweep })} />
            <ColorField label={t("analysis.colorLowSweep")} value={color.lowSweep}
              onChange={(v) => setColor({ kind: "liqSweep", highSweep: color.highSweep, lowSweep: v })} />
          </>
        ) : typeof color === "object" && color.kind === "fvg" ? (
          <>
            <ColorField label={t("analysis.colorBullish")} value={color.bullish}
              onChange={(v) => setColor({ kind: "fvg", bullish: v, bearish: color.bearish })} />
            <ColorField label={t("analysis.colorBearish")} value={color.bearish}
              onChange={(v) => setColor({ kind: "fvg", bullish: color.bullish, bearish: v })} />
          </>
        ) : typeof color === "object" && color.kind === "srLevels" ? (
          <>
            <ColorField label={t("analysis.colorSupport")} value={color.support}
              onChange={(v) => setColor({ kind: "srLevels", support: v, resistance: color.resistance })} />
            <ColorField label={t("analysis.colorResistance")} value={color.resistance}
              onChange={(v) => setColor({ kind: "srLevels", support: color.support, resistance: v })} />
          </>
        ) : typeof color === "object" && color.kind === "pivots" ? (
          <>
            <ColorField label={t("analysis.colorPp")} value={color.pp}
              onChange={(v) => setColor({ kind: "pivots", pp: v, resistance: color.resistance, support: color.support })} />
            <ColorField label={t("analysis.colorResistance")} value={color.resistance}
              onChange={(v) => setColor({ kind: "pivots", pp: color.pp, resistance: v, support: color.support })} />
            <ColorField label={t("analysis.colorSupport")} value={color.support}
              onChange={(v) => setColor({ kind: "pivots", pp: color.pp, resistance: color.resistance, support: v })} />
          </>
        ) : typeof color === "object" && color.kind === "volProfile" ? (
          <>
            <ColorField label={t("analysis.colorPoc")} value={color.poc}
              onChange={(v) => setColor({ kind: "volProfile", poc: v, valueArea: color.valueArea, histogram: color.histogram })} />
            <ColorField label={t("analysis.colorValueArea")} value={color.valueArea}
              onChange={(v) => setColor({ kind: "volProfile", poc: color.poc, valueArea: v, histogram: color.histogram })} />
            <ColorField label={t("analysis.colorHistogram")} value={color.histogram}
              onChange={(v) => setColor({ kind: "volProfile", poc: color.poc, valueArea: color.valueArea, histogram: v })} />
          </>
        ) : typeof color === "object" && color.kind === "orderBlock" ? (
          <>
            <ColorField label={t("analysis.colorBullish")} value={color.bullish}
              onChange={(v) => setColor({ kind: "orderBlock", bullish: v, bearish: color.bearish })} />
            <ColorField label={t("analysis.colorBearish")} value={color.bearish}
              onChange={(v) => setColor({ kind: "orderBlock", bullish: color.bullish, bearish: v })} />
          </>
        ) : (
          <ColorField
            label={t("analysis.color")}
            value={typeof color === "string" ? color : "#2563eb"}
            onChange={(v) => setColor(v)}
          />
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          {t("analysis.cancel")}
        </Button>
        <Button type="submit" size="sm">
          {t("analysis.apply")}
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
