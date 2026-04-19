import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Markdown } from "@/components/ai/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export const Route = createFileRoute("/_auth/dashboard_/my-learning")({
  component: MyLearningPage,
});

type Tab = "edit" | "preview";

function MyLearningPage() {
  const { t } = useTranslation();
  const utils = trpc.useUtils();

  const listQuery = trpc.learning.list.useQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const notes = listQuery.data ?? [];

  useEffect(() => {
    if (selectedId === null && notes.length > 0) {
      setSelectedId(notes[0]!.id);
    }
    if (selectedId !== null && !notes.some((n) => n.id === selectedId)) {
      setSelectedId(notes[0]?.id ?? null);
    }
  }, [notes, selectedId]);

  const createMutation = trpc.learning.create.useMutation({
    onSuccess: async ({ id }) => {
      await utils.learning.list.invalidate();
      setSelectedId(id);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("myLearning.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-muted-fg)]">{t("myLearning.intro")}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <Card className="self-start">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">{t("myLearning.title")}</CardTitle>
            <Button
              size="sm"
              onClick={() =>
                createMutation.mutate({
                  title: t("myLearning.untitled"),
                  description: "",
                  content: "",
                })
              }
              disabled={createMutation.isPending}
            >
              <Plus className="mr-1 h-4 w-4" />
              {t("myLearning.newNote")}
            </Button>
          </CardHeader>
          <CardContent>
            {listQuery.isLoading ? (
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted-fg)]">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-fg)]">{t("myLearning.noNotes")}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {notes.map((n) => {
                  const active = n.id === selectedId;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(n.id)}
                        className={`w-full rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                          active
                            ? "border-[var(--color-border)] bg-[var(--color-accent)] font-medium"
                            : "border-transparent hover:bg-[var(--color-accent)]/60"
                        }`}
                      >
                        <div className="truncate">{n.title}</div>
                        {n.description && (
                          <div className="truncate text-xs text-[var(--color-muted-fg)]">
                            {n.description}
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {selectedId ? (
          <NoteEditor key={selectedId} noteId={selectedId} />
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-[var(--color-muted-fg)]">
                {t("myLearning.selectNote")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function NoteEditor({ noteId }: { noteId: string }) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const noteQuery = trpc.learning.get.useQuery({ id: noteId });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("edit");

  useEffect(() => {
    if (!noteQuery.data) return;
    setTitle(noteQuery.data.title);
    setDescription(noteQuery.data.description);
    setContent(noteQuery.data.content);
    setLoaded(true);
  }, [noteQuery.data]);

  const initial = noteQuery.data;
  const dirty = useMemo(() => {
    if (!initial) return false;
    return (
      title !== initial.title ||
      description !== initial.description ||
      content !== initial.content
    );
  }, [initial, title, description, content]);

  const updateMutation = trpc.learning.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.learning.list.invalidate(),
        utils.learning.get.invalidate({ id: noteId }),
      ]);
      toast.success(t("myLearning.saved"));
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.learning.delete.useMutation({
    onSuccess: async () => {
      await utils.learning.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSave() {
    const tt = title.trim();
    if (!tt) {
      toast.error(t("myLearning.titlePlaceholder"));
      return;
    }
    updateMutation.mutate({ id: noteId, title: tt, description, content });
  }

  function handleDelete() {
    if (!window.confirm(t("myLearning.deleteConfirm"))) return;
    deleteMutation.mutate({ id: noteId });
  }

  if (noteQuery.isLoading || !loaded) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-sm text-[var(--color-muted-fg)]">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("myLearning.titlePlaceholder")}
          maxLength={120}
          className="text-base font-medium"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("myLearning.descriptionPlaceholder")}
          maxLength={500}
        />

        <div className="flex gap-1 border-b border-[var(--color-border)]">
          <TabButton
            active={tab === "edit"}
            onClick={() => setTab("edit")}
            label={t("myLearning.tabEdit")}
          />
          <TabButton
            active={tab === "preview"}
            onClick={() => setTab("preview")}
            label={t("myLearning.tabPreview")}
          />
          {dirty && (
            <span className="ml-auto self-center text-xs text-[var(--color-muted-fg)]">
              {t("myLearning.unsavedChanges")}
            </span>
          )}
        </div>

        {tab === "edit" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("myLearning.contentPlaceholder")}
            rows={22}
            maxLength={100_000}
            className="min-h-[480px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3 font-mono text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
        ) : (
          <div className="min-h-[480px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
            {content.trim() ? (
              <Markdown>{content}</Markdown>
            ) : (
              <p className="text-sm text-[var(--color-muted-fg)]">
                {t("myLearning.emptyPreview")}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending || !dirty || !title.trim()}
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            {updateMutation.isPending ? t("myLearning.saving") : t("myLearning.save")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            {t("myLearning.delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px rounded-t-md border-b-2 px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-[var(--color-fg)] font-medium"
          : "border-transparent text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]"
      }`}
    >
      {label}
    </button>
  );
}
