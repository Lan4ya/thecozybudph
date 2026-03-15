import { useFieldArray, useFormContext } from "react-hook-form";
import type { ProductFormInput, ProductWithRelations } from "@TheCozyBud/types";
import { useMemo, useEffect } from "react";
import { Input } from "@/lib/ui/__shadcn__/input";
import { cn } from "@/lib/utils/cn";

type Props = { updatingProduct: ProductWithRelations | null };

const ProductVariants = ({ updatingProduct }: Props) => {
  const { control, watch, setValue, register } =
    useFormContext<ProductFormInput>();

  // const { fields, append, remove } = useFieldArray({
  //   name: "variants",
  //   control,
  // });

  const [mode, options, variants, basePrice] = watch([
    "mode",
    "options",
    "variants",
    "basePrice",
  ]);

  const initPriceCents =
    mode === "create" ? basePrice * 100 : (updatingProduct?.minPriceCents ?? 0);

  const combinations = useMemo(() => generateCombinations(options), [options]);

  useEffect(() => {
    const existing = variants ?? [];
    const existingMap = new Map(
      existing.map((v) => [JSON.stringify(v.attributes), v]),
    );

    const nextVariants = combinations.map((combo) => {
      const key = JSON.stringify(combo);
      const match = existingMap.get(key);
      console.log("initial price cents: ", initPriceCents);

      if (match) return match; // keep orig

      const newVariant = {
        attributes: combo,
        priceCents: initPriceCents,
      };
      return newVariant;
    });

    setValue("variants", nextVariants, { shouldValidate: false });
  }, [combinations, initPriceCents]);

  const variantsInForm = variants ?? [];

  useEffect(() => {
    const subscription = watch((value) => {
      console.log("variants changed:", value.variants);
    });
    return () => subscription.unsubscribe();
  }, [watch("variants")]);

  const handlePriceChange = (index: number, value: string) => {
    if (value === "") {
      setValue(`variants.${index}.priceCents`, undefined);
      return;
    }
    const price = Number(value);
    setValue(`variants.${index}.priceCents`, Math.round(price * 100));
  };

  return (
    <div className="flex flex-col rounded-lg border bg-background overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[3fr_1fr] bg-muted/50 px-4 py-2 text-sm font-medium">
        <span>Attributes</span>
        <span>Price (PHP)</span>
      </div>

      {/* Rows */}
      {combinations.map((combo, idx) => {
        const variant = variantsInForm[idx];
        const price =
          variant?.priceCents === undefined ? "" : variant.priceCents / 100;

        return (
          <div
            key={idx}
            className={cn(
              "grid grid-cols-[3fr_1fr] items-center px-4 py-3 text-sm",
              "border-t",
            )}
          >
            <div className="flex flex-wrap gap-2">
              {Object.entries(combo).map(([name, val]) => (
                <span
                  key={name}
                  className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
                >
                  {name}: {val}
                </span>
              ))}
            </div>

            <Input
              type="text"
              inputMode="decimal"
              className="w-full"
              value={price}
              onChange={(e) => handlePriceChange(idx, e.target.value)}
              //{...register(`variants.${idx}.priceCents`)}
              onKeyDown={restrictDecimalInput}
              onPaste={restrictPaste}
            />
          </div>
        );
      })}
    </div>
  );
};

function restrictDecimalInput(e: React.KeyboardEvent<HTMLInputElement>) {
  if (
    !/[0-9.]$/.test(e.key) &&
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
}

function restrictPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const text = e.clipboardData.getData("text");
  if (!/^\d*\.?\d*$/.test(text)) e.preventDefault();
}

function generateCombinations(options: ProductFormInput["options"]) {
  if (!options?.length) return [];

  return options.reduce<Record<string, string>[]>((acc, option) => {
    if (!acc.length) {
      return option.values.map((val) => ({ [option.name]: val }));
    }

    const next: Record<string, string>[] = [];

    acc.forEach((combo) => {
      option.values.forEach((val) => {
        next.push({ ...combo, [option.name]: val });
      });
    });

    return next;
  }, []);
}

export default ProductVariants;
