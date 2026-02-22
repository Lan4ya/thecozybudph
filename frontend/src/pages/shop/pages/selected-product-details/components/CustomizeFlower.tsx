import { Gift } from "lucide-react";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useState } from "react";
import type { Product } from "@TheCozyBud/types";

type Props = {
  options: Product["options"];
  selectedOptions: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  cardMessage: string;
  setCardMessage: (msg: string) => void;
  maxSelectPerOption?: number;
};

export default function CustomizeFlower({
  options,
  selectedOptions,
  onChange,
  cardMessage,
  setCardMessage,
}: Props) {
  const selectValue = (optionName: string, value: string) => {
    const currentValue = selectedOptions[optionName];

    if (value === currentValue) return;

    onChange({
      ...selectedOptions,
      [optionName]: value,
    });
  };

  return (
    <div className="space-y-4 py-6 border-b">
      <h3 className="font-semibold">Customize Arrangement</h3>

      <div className="space-y-6 p-4 border rounded-md">
        {options.map((option) => {
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
                      onClick={() => selectValue(option.name, value)}
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

          <CardMessageInput
            cardMessage={cardMessage}
            setCardMessage={setCardMessage}
          />
        </div>
      </div>
    </div>
  );
}

type CardMessageInputProps = {
  cardMessage: string;
  setCardMessage: (value: string) => void;
};

const CardMessageInput = ({
  cardMessage,
  setCardMessage,
}: CardMessageInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState(cardMessage);

  return (
    <div
      className="flex flex-col"
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
          setDraft(cardMessage);
        }
      }}
    >
      <Textarea
        placeholder="Write your heartfelt message here..."
        className="min-h-20 resize-none focus:border-primary transition-colors text-sm"
        maxLength={600}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Included free with your flowers</span>
        <span>{draft.length}/600</span>
      </div>

      {isFocused && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setDraft(cardMessage);
              setIsFocused(false);
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              setCardMessage(draft);
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
