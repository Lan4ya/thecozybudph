import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/lib/ui/__shadcn__/input";
import { cn } from "@/lib/utils/cn";

export function ColorTagsInput({
  value,
  onChange,
  className,
  max = 50, // sensible limit
}: {
  value: string[];
  onChange: (colors: string[]) => void;
  className?: string;
  max?: number;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateColor = (color: string) => {
    if (!color) return "Color cannot be empty.";
    if (!/^[a-z\s]+$/i.test(color)) return "Only letters are allowed.";
    if (color.length > 20) return "Color name too long.";
    if (value.includes(color)) return "Already added.";
    if (value.length >= max) return `Max ${max} colors allowed.`;
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
    onChange([...value, color]);
    setInput("");
  };

  const removeColor = (color: string) => {
    onChange(value.filter((c) => c !== color));
    setError(null);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Tag list */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((color) => (
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
        <Input
          placeholder="Type color name and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addColor();
            }
          }}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
