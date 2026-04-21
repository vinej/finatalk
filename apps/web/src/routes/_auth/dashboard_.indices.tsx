import { createFileRoute, Link } from "@tanstack/react-router";
import { LineChart, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INDICES, type IndexKey } from "@/lib/indices";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/indices")({
  component: IndicesPage,
});

function IndicesPage() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<IndexKey>("sp500");
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const query = trpc.market.getIndexConstituents.useQuery(
    { indexSymbol: activeIndex },
    { staleTime: 10 * 60_000, retry: false },
  );

  const constituents = query.data ?? [];

  const sectors = useMemo(() => {
    const set = new Set<string>();
    for (const c of constituents) if (c.sector) set.add(c.sector);
    return [...set].sort();
  }, [constituents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return constituents.filter((c) => {
      if (sectorFilter !== "all" && c.sector !== sectorFilter) return false;
      if (!q) return true;
      return (
        c.symbol.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.sector ?? "").toLowerCase().includes(q)
      );
    });
  }, [constituents, search, sectorFilter]);

  const sectorCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of constituents) {
      if (!c.sector) continue;
      map.set(c.sector, (map.get(c.sector) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [constituents]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold">{t("indices.title")}</h1>
        <p className="text-sm text-[var(--color-muted-fg)]">{t("indices.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-2">
        {INDICES.map((idx) => (
          <button
            key={idx.key}
            type="button"
            onClick={() => {
              setActiveIndex(idx.key);
              setSectorFilter("all");
              setSearch("");
            }}
            className={
              "rounded-md px-3 py-1.5 text-sm transition-colors " +
              (activeIndex === idx.key
                ? "bg-[var(--color-accent)] font-semibold text-[var(--color-fg)]"
                : "text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)]/40")
            }
          >
            {t(idx.labelKey)}
          </button>
        ))}
        <div className="ml-auto">
          <Link
            to="/dashboard/analysis"
            search={{ symbol: INDICES.find((i) => i.key === activeIndex)?.yahooSymbol }}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-primary)] hover:bg-[var(--color-accent)]/40"
          >
            <LineChart className="h-4 w-4" />
            {t("indices.analyzeIndex")}
          </Link>
        </div>
      </div>

      {query.isPending ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("indices.loading")}
        </div>
      ) : constituents.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-[var(--color-muted-fg)]">
            {t("indices.empty")}
          </CardContent>
        </Card>
      ) : (
        <>
          {sectorCounts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("indices.sectorSummary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sectorCounts.map(([sector, count]) => {
                    const pct = (count / constituents.length) * 100;
                    const active = sectorFilter === sector;
                    return (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => setSectorFilter(active ? "all" : sector)}
                        className={
                          "rounded-md border px-2.5 py-1 text-xs transition-colors " +
                          (active
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : "border-[var(--color-border)] hover:bg-[var(--color-accent)]")
                        }
                      >
                        <span className="font-medium">{sector}</span>
                        <span className="ml-1.5 text-[var(--color-muted-fg)]">
                          {count} · {pct.toFixed(1)}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-fg)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("indices.searchPlaceholder")}
                className="pl-8"
              />
            </div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="h-10 rounded-md border border-[var(--color-border)] bg-transparent px-3 text-sm"
            >
              <option value="all">{t("indices.allSectors")}</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-[var(--color-muted-fg)]">
              {t("indices.showingCount", { shown: filtered.length, total: constituents.length })}
            </span>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--color-border)] bg-[var(--color-accent)]/20 text-left text-xs uppercase tracking-wide text-[var(--color-muted-fg)]">
                    <tr>
                      <th className="px-3 py-2">{t("indices.colSymbol")}</th>
                      <th className="px-3 py-2">{t("indices.colName")}</th>
                      <th className="px-3 py-2">{t("indices.colSector")}</th>
                      <th className="px-3 py-2 hidden md:table-cell">{t("indices.colSubSector")}</th>
                      <th className="px-3 py-2 hidden lg:table-cell">{t("indices.colHq")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.symbol} className="border-b border-[var(--color-border)] hover:bg-[var(--color-accent)]/40">
                        <td className="px-3 py-2 font-mono font-semibold">
                          <Link
                            to="/dashboard/analysis"
                            search={{ symbol: c.symbol }}
                            className="text-[var(--color-primary)] hover:underline"
                          >
                            {c.symbol}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-[var(--color-muted-fg)]">{c.sector ?? "—"}</td>
                        <td className="px-3 py-2 text-[var(--color-muted-fg)] hidden md:table-cell">{c.subSector ?? "—"}</td>
                        <td className="px-3 py-2 text-[var(--color-muted-fg)] hidden lg:table-cell">{c.headquarters ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
