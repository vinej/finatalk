import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const countQuery = trpc.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const listQuery = trpc.notification.list.useQuery(undefined, {
    enabled: open,
  });
  const utils = trpc.useUtils();

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      void utils.notification.unreadCount.invalidate();
      void utils.notification.list.invalidate();
    },
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      void utils.notification.unreadCount.invalidate();
      void utils.notification.list.invalidate();
    },
  });
  const deleteNotif = trpc.notification.delete.useMutation({
    onSuccess: () => {
      void utils.notification.unreadCount.invalidate();
      void utils.notification.list.invalidate();
    },
  });

  const count = countQuery.data?.count ?? 0;
  const items = listQuery.data ?? [];

  function handleClick(item: (typeof items)[number]) {
    if (!item.read) markRead.mutate({ id: item.id });
    if (item.link) {
      setOpen(false);
      void navigate({ to: item.link });
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="relative"
        aria-label={t("notifications.title")}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-destructive)] px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2">
              <span className="text-sm font-semibold">{t("notifications.title")}</span>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllRead.mutate()}
                    title={t("notifications.markAllRead")}
                    className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded p-1 text-[var(--color-muted-fg)] hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[var(--color-muted-fg)]">
                  {t("notifications.empty")}
                </p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={
                      "group flex items-start gap-2 border-b border-[var(--color-border)] px-3 py-2 last:border-0" +
                      (item.read ? "" : " bg-[var(--color-accent)]/40") +
                      (item.link ? " cursor-pointer hover:bg-[var(--color-accent)]" : "")
                    }
                    onClick={() => handleClick(item)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={"text-xs font-medium" + (item.read ? " text-[var(--color-muted-fg)]" : "")}>
                        {item.title}
                      </p>
                      {item.body && (
                        <p className="mt-0.5 text-xs text-[var(--color-muted-fg)] line-clamp-2">
                          {item.body}
                        </p>
                      )}
                      <p className="mt-0.5 text-[10px] text-[var(--color-muted-fg)]">
                        {formatRelative(item.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif.mutate({ id: item.id });
                      }}
                      title={t("notifications.delete")}
                      className="shrink-0 rounded p-1 text-[var(--color-muted-fg)] opacity-0 hover:bg-[var(--color-accent)] hover:text-[var(--color-fg)] group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}
