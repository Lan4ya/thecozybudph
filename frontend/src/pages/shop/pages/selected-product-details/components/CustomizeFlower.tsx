import { Gift } from "lucide-react";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useState } from "react";
import type { Product } from "@TheCozyBud/types";
import { useProductSelectionStore } from "@/store/useProductSelectionStore";

type Props = {
  productOptions: Product["options"];
};

export default function CustomizeFlower({ productOptions }: Props) {
  const selectedOptions = useProductSelectionStore((s) => s.selectedOptions);

  const setSelectedOptions = useProductSelectionStore(
    (s) => s.setSelectedOptions,
  );

  const selectOption = (optionName: string, value: string) => {
    const currentValue = selectedOptions[optionName];

    if (value === currentValue) return;

    setSelectedOptions({
      ...selectedOptions,
      [optionName]: value,
    });
  };

  return (
    <div className="space-y-4 py-6 border-b">
      <h3 className="font-semibold">Customize Arrangement</h3>

      <div className="space-y-6 p-4 border rounded-md">
        {productOptions.map((option) => {
          const selectedValues = selectedOptions[option.name] ?? [];

          return (
            <div key={option.name} className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                {option.name}
              </div>

              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selectedValues.includes(value);

                  return (
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      key={value}
                      onClick={() => selectOption(option.name, value)}
                    >
                      {value}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Card Message */}
        <div className="space-y-2 pt-4 border-t">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Add a card message (optional)
          </label>

          <CardMessageInput />
        </div>
      </div>
    </div>
  );
}

const CardMessageInput = () => {
  const cardMessages = useProductSelectionStore((s) => s.cardMessages);
  const setCardMessage = useProductSelectionStore((s) => s.setCardMessage);

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="flex flex-col"
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
          setCardMessage(0, cardMessages[0]);
        }
      }}
    >
      <Textarea
        placeholder="Write your heartfelt message here..."
        className="min-h-20 resize-none focus:border-primary transition-colors text-sm"
        maxLength={600}
        value={cardMessages[0]}
        onChange={(e) => setCardMessage(0, e.target.value)}
      />

      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>Included free with your flowers</span>
        <span>{cardMessages[0].length}/600</span>
      </div>

      {isFocused && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setCardMessage(0, cardMessages[0]);
              setIsFocused(false);
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              setCardMessage(0, cardMessages[0]);
              setIsFocused(false);
            }}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};
