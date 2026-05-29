import { cn } from "@/lib/utils/cn";
import { capitalizeFirstLetter } from "@/lib/utils/format";

interface ShippingOptionProps {
  serviceType: string;
  price?: string | number;
  isSelected: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  estimatedDays?: string;
}

export const ShippingOption = ({
  serviceType,
  price,
  isSelected,
  onSelect,
  disabled = false,
  estimatedDays = "4-7 business days",
}: ShippingOptionProps) => {
  const normalizedServiceType = serviceType.toLowerCase();

  return (
    <label
      className={cn(
        "flex items-start justify-between p-3 rounded-lg border transition-all",
        !disabled ? "cursor-pointer" : "cursor-not-allowed opacity-60 grayscale-[0.5]",
        isSelected && !disabled
          ? "border-primary bg-primary/5"
          : "border-border/40",
        !disabled && !isSelected && "hover:border-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="shippingOption"
          value={normalizedServiceType}
          checked={isSelected}
          onChange={!disabled ? onSelect : undefined}
          disabled={disabled}
          className={cn(
            "mt-1 text-primary focus:ring-primary",
            disabled && "cursor-not-allowed"
          )}
        />

        <div>
          <p className="font-medium text-foreground">
            {capitalizeFirstLetter(normalizedServiceType)}
          </p>

          <p className="text-xs text-muted-foreground">
            Estimated around {estimatedDays}
          </p>
        </div>
      </div>

      {price !== undefined && !disabled && (
        <p className="font-semibold text-sm text-foreground">
          ₱{price}
        </p>
      )}
    </label>
  );
};
