import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AnalysisBrowser } from "@/components/markets/analysis-panel";
import type { ActiveIndicator } from "@/lib/indicator-defaults";

export type AnalysisLoadData = {
  items: ActiveIndicator[];
  id: string;
  symbol: string;
  title: string;
  description: string;
  range: string;
  interval: string;
  convertTo: "CAD" | null;
};

export function OpenAnalysisAction({
  indicators,
  loadedAnalysisId,
  loadedAnalysisTitle,
  onLoad,
  onLoadedChange,
}: {
  indicators: ActiveIndicator[];
  loadedAnalysisId: string | null;
  loadedAnalysisTitle: string | null;
  onLoad: (data: AnalysisLoadData) => void;
  onLoadedChange: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t("markets.openAnalyses")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title={t("markets.allAnalyses")}>
        <AnalysisBrowser
          indicators={indicators}
          loadedAnalysisId={loadedAnalysisId}
          loadedAnalysisTitle={loadedAnalysisTitle}
          onLoad={(data) => {
            onLoad(data);
            setOpen(false);
          }}
          onLoadedChange={onLoadedChange}
        />
      </Dialog>
    </>
  );
}
