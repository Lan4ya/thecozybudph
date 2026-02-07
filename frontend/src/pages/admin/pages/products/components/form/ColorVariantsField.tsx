import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/lib/ui/__shadcn__/input";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";

export function ColorTagsInput({
  colorVals,
  onChange,
  className,
  max = 100, // sane limit
}: {
  colorVals: string[];
  onChange: (colors: string[]) => void;
  className?: string;
  max?: number;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateColor = (color: string) => {
    if (!color) return "color name can't be empty";
    if (color.length > 100) return "color name can't exceed 100 characters";
    if (colorVals.includes(color)) return "color already exists";
    if (colorVals.length >= max) return `max ${max} colors are allowed`;
    return null;
  };

  const addColor = () => {
    const color = input.trim().toLowerCase();
    const validation = validateColor(color);

    if (validation) {
      setError(validation);
      return;
    }

    setError(null);
    onChange([...colorVals, color]);
    setInput("");
  };

  const removeColor = (color: string) => {
    onChange(colorVals.filter((c) => c !== color));
    setError(null);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Tag list */}
      {colorVals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colorVals.map((color) => (
            <span
              key={color}
              className={cn(
                "cursor-pointer hover:opacity-80 flex items-center gap-1 rounded-full px-2 py-1 text-foreground text-xs capitalize transition",
                "shadow-sm border border-border",
                color === "black" && "text-primary-foreground",
              )}
              style={{ backgroundColor: color }}
              onClick={() => removeColor(color)}
            >
              {color}
              <X className="size-3" />
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div>
        <div className="flex gap-2">
          <Input
            className="max-[390px]:placeholder:text-[11px]"
            placeholder="type color and click add color"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                !/[a-zA-Z]$/.test(e.key) &&
                ![
                  "Backspace",
                  "Tab",
                  "ArrowLeft",
                  "ArrowRight",
                  "Delete",
                  "Enter",
                ].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
          />
          <Button variant="outline" type="button" onClick={addColor}>
            Add Color
          </Button>
        </div>
        {error && (
          <p className="mt-1 text-xs text-destructive animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
