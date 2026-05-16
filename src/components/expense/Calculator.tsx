import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onResult: (value: number) => void;
}

const KEYS = [
  ["C", "(", ")", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["0", ".", "⌫", "="],
];

export function Calculator({ onResult }: Props) {
  const [expr, setExpr] = useState("");

  const compute = (e: string) => {
    const safe = e.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    if (!/^[\d+\-*/().\s]*$/.test(safe)) return null;
    try {
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict"; return (${safe || 0})`)();
      return typeof v === "number" && isFinite(v) ? v : null;
    } catch {
      return null;
    }
  };

  const press = (k: string) => {
    if (k === "C") return setExpr("");
    if (k === "⌫") return setExpr((s) => s.slice(0, -1));
    if (k === "=") {
      const v = compute(expr);
      if (v !== null) {
        setExpr(String(v));
        onResult(v);
      }
      return;
    }
    setExpr((s) => s + k);
  };

  const preview = compute(expr);

  return (
    <div className="w-64 space-y-3 p-1">
      <div className="rounded-lg bg-muted px-3 py-2 text-right">
        <div className="text-xs text-muted-foreground truncate">{expr || "0"}</div>
        <div className="text-2xl font-display font-semibold">
          {preview !== null ? preview : "—"}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.flat().map((k) => (
          <Button
            key={k}
            type="button"
            variant={["÷", "×", "−", "+", "="].includes(k) ? "default" : "secondary"}
            size="sm"
            className="h-10"
            onClick={() => press(k)}
          >
            {k}
          </Button>
        ))}
      </div>
    </div>
  );
}
