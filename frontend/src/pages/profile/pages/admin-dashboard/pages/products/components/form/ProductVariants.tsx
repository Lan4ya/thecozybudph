import { useFormContext, useWatch } from "react-hook-form";
import type {
  ProductFormInput,
  ProductWithRelations,
} from "@TheCozyBud/schemas";
import { useMemo, useEffect } from "react";
import { Input } from "@/lib/ui/__shadcn__/input";
import { cn } from "@/lib/utils/cn";
import { FieldError } from "@/pages/checkout/components/FieldError";

type Props = { updatingProduct: ProductWithRelations | null };

const ProductVariants = ({ updatingProduct }: Props) => {
  const {
    formState: { errors },
    setValue,
    getValues,
    register,
    control,
  } = useFormContext<ProductFormInput>();

  const [mode, variants, options, basePrice] = useWatch({
    name: ["mode", "variants", "options", "basePrice"],
    control,
  });

  const initPriceInput =
    mode === "create"
      ? basePrice
      : String((updatingProduct?.minPriceCents ?? 0) / 100);

  const combinations = useMemo(() => {
    return generateCombinations(options);
  }, [JSON.stringify(options)]); // Compare by value to avoid infinite re-render

  useEffect(() => {
    const currentVariants = getValues("variants") ?? [];

    const existingMap = new Map(
      currentVariants.map((v) => [JSON.stringify(v.attributes), v]),
    );

    const nextVariants = combinations.map((combo) => {
      const key = JSON.stringify(combo);
      const match = existingMap.get(key);

      if (match) return match;

      const newVariant = {
        attributes: combo,
        priceCents: initPriceInput,
      };
      return newVariant;
    });

    setValue("variants", nextVariants, { shouldValidate: false });
  }, [combinations, initPriceInput, setValue, getValues]);

  return (
    <div className="flex flex-col rounded-lg border overflow-hidden">
      <div className="grid grid-cols-[3fr_1fr] bg-sidebar px-4 py-2 text-sm font-medium">
        <span>Attributes</span>
        <span>Price (PHP)</span>
      </div>

      {/* Rows */}
      {combinations.map((combo, idx) => {
        const variant = variants?.[idx];
        const pricePHP = variant?.priceCents ?? initPriceInput;

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
                  className="rounded-md border px-2 py-1 text-xs font-medium"
                >
                  {name}: {val}
                </span>
              ))}
            </div>

            <div>
              <Input
                type="text"
                inputMode="numeric"
                value={pricePHP}
                {...register(`variants.${idx}.priceCents`)}
              />

              <FieldError
                message={errors.variants?.[idx]?.priceCents?.message}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
