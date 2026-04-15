import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SavedChartsBrowser, type LoadedChart } from "@/components/markets/saved-charts-panel";

export function OpenSavedChartsAction({ onLoad }: { onLoad: (chart: LoadedChart) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t("markets.openSavedCharts")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title={t("markets.savedCharts")}>
        <SavedChartsBrowser
          onLoad={(c) => {
            onLoad(c);
            setOpen(false);
          }}
        />
      </Dialog>
    </>
  );
}
