import { describe, expect, it } from "vitest";
import type {
  BacktestAnalyzeResult,
  BacktestCandle,
} from "@/lib/backtest-engine";
import { evaluateStrategy } from "@/lib/strategy-signals";

function candleAt(close: number, time = 0): BacktestCandle {
  return { time, open: close, high: close, low: close, close, volume: 1 };
}

function line(kind: string, spec: object, value: number): BacktestAnalyzeResult {
  return {
    kind,
    spec,
    series: [{ time: 0, value }],
  } as unknown as BacktestAnalyzeResult;
}

describe("evaluateStrategy", () => {
  it("returns null when there are no candles", () => {
    expect(evaluateStrategy("trendPullback", [], [], "en")).toBeNull();
  });

  describe("trendPullback", () => {
    it("emits buy when price > EMA and RSI is in the pullback zone", () => {
      const candles = [candleAt(110)];
      const results = [
        line("ema", { kind: "ema", period: 50 }, 100),
        line("rsi", { kind: "rsi", period: 14 }, 45),
      ];
      const sig = evaluateStrategy("trendPullback", results, candles, "en");
      expect(sig?.action).toBe("buy");
    });

    it("emits sell when price < EMA and RSI is in the 50–60 band", () => {
      const candles = [candleAt(90)];
      const results = [
        line("ema", { kind: "ema", period: 50 }, 100),
        line("rsi", { kind: "rsi", period: 14 }, 55),
      ];
      const sig = evaluateStrategy("trendPullback", results, candles, "en");
      expect(sig?.action).toBe("sell");
    });

    it("emits exitLong when overbought in an uptrend", () => {
      const candles = [candleAt(110)];
      const results = [
        line("ema", { kind: "ema", period: 50 }, 100),
        line("rsi", { kind: "rsi", period: 14 }, 75),
      ];
      const sig = evaluateStrategy("trendPullback", results, candles, "en");
      expect(sig?.action).toBe("exitLong");
    });

    it("waits when EMA or RSI is missing", () => {
      const candles = [candleAt(110)];
      const sig = evaluateStrategy("trendPullback", [], candles, "en");
      expect(sig?.action).toBe("wait");
      expect(sig?.reasons.length).toBeGreaterThan(0);
    });

    it("respects VWAP filter — suppresses long when price is below VWAP", () => {
      const candles = [candleAt(110)];
      const results = [
        line("ema", { kind: "ema", period: 50 }, 100),
        line("rsi", { kind: "rsi", period: 14 }, 45),
        line("vwap", { kind: "vwap" }, 120), // price 110 < VWAP 120 → long blocked
      ];
      const sig = evaluateStrategy("trendPullback", results, candles, "en");
      expect(sig?.action).not.toBe("buy");
    });

    it("localizes reasons to French when requested", () => {
      const candles = [candleAt(110)];
      const results = [
        line("ema", { kind: "ema", period: 50 }, 100),
        line("rsi", { kind: "rsi", period: 14 }, 45),
      ];
      const sig = evaluateStrategy("trendPullback", results, candles, "fr");
      const joined = (sig?.reasons ?? []).join(" ");
      expect(joined).toMatch(/tendance|pullback|hausse/i);
    });
  });

  describe("meanReversion", () => {
    it("emits buy when at least two oversold confirmations stack", () => {
      const candles = [candleAt(100)];
      const results = [
        line("rsi", { kind: "rsi", period: 14 }, 25),
        line("zscore", { kind: "zscore", period: 20 }, -2.5),
      ];
      const sig = evaluateStrategy("meanReversion", results, candles, "en");
      expect(sig?.action).toBe("buy");
    });

    it("emits sell when at least two overbought confirmations stack", () => {
      const candles = [candleAt(100)];
      const results = [
        line("rsi", { kind: "rsi", period: 14 }, 75),
        line("zscore", { kind: "zscore", period: 20 }, 2.5),
      ];
      const sig = evaluateStrategy("meanReversion", results, candles, "en");
      expect(sig?.action).toBe("sell");
    });

    it("waits with a single confirmation (no strong stack)", () => {
      const candles = [candleAt(100)];
      const results = [line("rsi", { kind: "rsi", period: 14 }, 25)];
      const sig = evaluateStrategy("meanReversion", results, candles, "en");
      expect(sig?.action).toBe("wait");
    });

    it("refuses to trade when ADX signals a strong trend", () => {
      const candles = [candleAt(100)];
      const adx: BacktestAnalyzeResult = {
        kind: "adx",
        spec: { kind: "adx", period: 14 },
        series: [{ time: 0, adx: 35, pdi: 20, mdi: 15 }],
      } as unknown as BacktestAnalyzeResult;
      const results = [
        line("rsi", { kind: "rsi", period: 14 }, 25),
        line("zscore", { kind: "zscore", period: 20 }, -2.5),
        adx,
      ];
      const sig = evaluateStrategy("meanReversion", results, candles, "en");
      expect(sig?.action).toBe("wait");
    });
  });

  describe("maCrossover", () => {
    it("emits buy on a recent bullish cross", () => {
      const candles = [candleAt(100, 4)];
      const times = [0, 1, 2, 3, 4];
      const maCross: BacktestAnalyzeResult = {
        kind: "maCross",
        spec: { kind: "maCross", fastPeriod: 50, slowPeriod: 200, maType: "sma" },
        series: {
          fast: times.map((time) => ({ time, value: 110 })),
          slow: times.map((time) => ({ time, value: 100 })),
          events: [{ time: 4, direction: "bull" }],
        },
      } as unknown as BacktestAnalyzeResult;
      const sig = evaluateStrategy("maCrossover", [maCross], candles, "en");
      expect(sig?.action).toBe("buy");
    });

    it("waits when there is no cross event", () => {
      const candles = [candleAt(100, 4)];
      const times = [0, 1, 2, 3, 4];
      const maCross: BacktestAnalyzeResult = {
        kind: "maCross",
        spec: { kind: "maCross", fastPeriod: 50, slowPeriod: 200, maType: "sma" },
        series: {
          fast: times.map((time) => ({ time, value: 110 })),
          slow: times.map((time) => ({ time, value: 100 })),
          events: [],
        },
      } as unknown as BacktestAnalyzeResult;
      const sig = evaluateStrategy("maCrossover", [maCross], candles, "en");
      expect(sig?.action).toBe("wait");
    });

    it("waits when the indicator is absent", () => {
      const sig = evaluateStrategy("maCrossover", [], [candleAt(100)], "en");
      expect(sig?.action).toBe("wait");
    });
  });

  describe("breakoutMomentum", () => {
    it("emits buy on a close at or above the Donchian upper band", () => {
      const candles = [candleAt(105)];
      const donchian: BacktestAnalyzeResult = {
        kind: "donchian",
        spec: { kind: "donchian", period: 20 },
        series: [
          { time: 0, upper: 104, middle: 100, lower: 96 },
          { time: 0, upper: 105, middle: 100, lower: 95 },
        ],
      } as unknown as BacktestAnalyzeResult;
      const sig = evaluateStrategy("breakoutMomentum", [donchian], candles, "en");
      expect(sig?.action).toBe("buy");
    });

    it("emits sell on a close at or below the Donchian lower band", () => {
      const candles = [candleAt(95)];
      const donchian: BacktestAnalyzeResult = {
        kind: "donchian",
        spec: { kind: "donchian", period: 20 },
        series: [
          { time: 0, upper: 106, middle: 100, lower: 96 },
          { time: 0, upper: 105, middle: 100, lower: 95 },
        ],
      } as unknown as BacktestAnalyzeResult;
      const sig = evaluateStrategy("breakoutMomentum", [donchian], candles, "en");
      expect(sig?.action).toBe("sell");
    });

    it("waits inside the Donchian range", () => {
      const candles = [candleAt(100)];
      const donchian: BacktestAnalyzeResult = {
        kind: "donchian",
        spec: { kind: "donchian", period: 20 },
        series: [
          { time: 0, upper: 110, middle: 100, lower: 90 },
          { time: 0, upper: 110, middle: 100, lower: 90 },
        ],
      } as unknown as BacktestAnalyzeResult;
      const sig = evaluateStrategy("breakoutMomentum", [donchian], candles, "en");
      expect(sig?.action).toBe("wait");
    });
  });
});
