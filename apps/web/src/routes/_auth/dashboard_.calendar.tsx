import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/calendar")({
  component: CalendarPage,
});

type CalendarEvent = {
  symbol: string;
  eventType: "earnings" | "ex-dividend" | "dividend";
  date: string;
  title: string;
  details: Record<string, unknown>;
};

function CalendarPage() {
  const { t } = useTranslation();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const portfoliosQuery = trpc.portfolio.listPortfolios.useQuery();
  const watchlistQuery = trpc.watchlist.get.useQuery();

  const portfolioIds = portfoliosQuery.data?.map((p) => p.id) ?? [];

  const holdingsQueries = trpc.useQueries((t) =>
    portfolioIds.map((id) => t.portfolio.getPortfolio({ id })),
  );

  const symbols = useMemo(() => {
    const set = new Set<string>();
    for (const q of holdingsQueries) {
      if (q.data) {
        for (const h of q.data.holdings) set.add(h.symbol.toUpperCase());
      }
    }
    if (watchlistQuery.data) {
      for (const item of watchlistQuery.data.items) set.add(item.symbol.toUpperCase());
    }
    return [...set].sort();
  }, [holdingsQueries, watchlistQuery.data]);

  const calendarQuery = trpc.market.getEarningsCalendar.useQuery(
    { symbols },
    { enabled: symbols.length > 0, staleTime: 300_000, retry: false },
  );

  const events = calendarQuery.data?.events ?? [];
  const errors = calendarQuery.data?.errors ?? [];

  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const firstDow = new Date(month.year, month.month, 1).getDay();

  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const d = new Date(e.date + "T00:00:00");
      if (d.getFullYear() === month.year && d.getMonth() === month.month) {
        const key = e.date;
        const arr = m.get(key) ?? [];
        arr.push(e);
        m.set(key, arr);
      }
    }
    return m;
  }, [events, month]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((e) => e.date >= today).slice(0, 20);
  }, [events]);

  function prevMonth() {
    setMonth((m) => {
      const d = new Date(m.year, m.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setMonth((m) => {
      const d = new Date(m.year, m.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    const now = new Date();
    setMonth({ year: now.getFullYear(), month: now.getMonth() });
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const monthLabel = new Date(month.year, month.month, 1).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const loading = portfoliosQuery.isPending || calendarQuery.isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center gap-3">
        <CalendarDays className="h-5 w-5 text-[var(--color-muted-fg)]" />
        <h1 className="text-lg font-semibold">{t("calendar.title")}</h1>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[var(--color-muted-fg)]" />}
      </header>

      <p className="text-xs text-[var(--color-muted-fg)]">
        {t("calendar.desc", { count: symbols.length })}
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-sm font-semibold">{monthLabel}</CardTitle>
              <Button type="button" size="sm" variant="ghost" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={goToday}>
              {t("calendar.today")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {weekDays.map((d) => (
                <div key={d} className="py-1 text-center text-[10px] font-medium uppercase text-[var(--color-muted-fg)]">
                  {d}
                </div>
              ))}

              {Array.from({ length: firstDow }, (_, i) => (
                <div key={`empty-${i}`} className="min-h-[70px]" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDate.get(dateStr) ?? [];
                const isToday = dateStr === todayIso;

                return (
                  <div
                    key={day}
                    className={
                      "min-h-[70px] rounded border p-1 " +
                      (isToday
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)]")
                    }
                  >
                    <div className={`text-xs ${isToday ? "font-bold text-[var(--color-primary)]" : "text-[var(--color-muted-fg)]"}`}>
                      {day}
                    </div>
                    <div className="mt-0.5 flex flex-col gap-0.5">
                      {dayEvents.slice(0, 3).map((e, ei) => (
                        <div
                          key={ei}
                          className={
                            "truncate rounded px-1 py-0.5 text-[9px] font-medium " +
                            (e.eventType === "earnings"
                              ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                              : e.eventType === "ex-dividend"
                                ? "bg-[#ef4444]/15 text-[#ef4444]"
                                : "bg-[#10b981]/15 text-[#10b981]")
                          }
                          title={e.title}
                        >
                          {e.symbol}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-[var(--color-muted-fg)]">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{t("calendar.upcoming")}</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-[var(--color-muted-fg)]">{t("calendar.noEvents")}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {upcomingEvents.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 border-b border-[var(--color-border)] pb-2 last:border-0">
                      <div
                        className={
                          "mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase " +
                          (e.eventType === "earnings"
                            ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                            : e.eventType === "ex-dividend"
                              ? "bg-[#ef4444]/15 text-[#ef4444]"
                              : "bg-[#10b981]/15 text-[#10b981]")
                        }
                      >
                        {t(`calendar.${e.eventType}`)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium">{e.symbol}</p>
                        <p className="text-[10px] text-[var(--color-muted-fg)]">{e.date}</p>
                        {e.eventType === "earnings" && e.details.earningsAverage != null && (
                          <p className="text-[10px] text-[var(--color-muted-fg)]">
                            {t("calendar.epsEst")}: ${Number(e.details.earningsAverage).toFixed(2)}
                          </p>
                        )}
                        {e.eventType === "earnings" && e.details.epsActual != null && (
                          <p className="text-[10px] text-[var(--color-muted-fg)]">
                            {t("calendar.epsActual")}: ${Number(e.details.epsActual).toFixed(2)}
                            {e.details.surprisePercent != null && (
                              <span className={Number(e.details.surprisePercent) >= 0 ? " text-[#10b981]" : " text-[#ef4444]"}>
                                {" "}({Number(e.details.surprisePercent) > 0 ? "+" : ""}{Number(e.details.surprisePercent).toFixed(1)}%)
                              </span>
                            )}
                          </p>
                        )}
                        {(e.eventType === "ex-dividend" || e.eventType === "dividend") && e.details.dividendRate != null && (
                          <p className="text-[10px] text-[var(--color-muted-fg)]">
                            ${Number(e.details.dividendRate).toFixed(2)}/yr
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{t("calendar.legend")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block h-3 w-3 rounded bg-[#f59e0b]/30" />
                  {t("calendar.earnings")}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block h-3 w-3 rounded bg-[#ef4444]/30" />
                  {t("calendar.ex-dividend")}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-block h-3 w-3 rounded bg-[#10b981]/30" />
                  {t("calendar.dividend")}
                </div>
              </div>
            </CardContent>
          </Card>

          {errors.length > 0 && (
            <p className="text-xs text-[var(--color-muted-fg)]">
              {t("calendar.errors", { symbols: errors.join(", ") })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
