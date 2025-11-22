import React, { useRef, useEffect, useContext, forwardRef } from "react";
import { DropdownMenuContext } from "./DropdownMenu";
import { cn } from "@/lib/utils/cn";

export const DropdownMenuItem = forwardRef<
    HTMLElement,
    React.PropsWithChildren<{
        disabled?: boolean;
        onSelect?: () => void;
        className?: string;
    }> &
        React.HTMLAttributes<HTMLElement>
>((props, forwardedRef) => {
    const ctx = useContext(DropdownMenuContext);
    if (!ctx) throw new Error("DropdownMenuItem used outside DropdownMenu");
    const {
        registerItem,
        unregisterItem,
        focusedIndex,
        focusItem,
        // setOpen,
        triggerRef,
        items,
        isKeyboardNav,
    } = ctx;
    const { disabled = false, onSelect, children, className, ...rest } = props;
    const itemRef = useRef<HTMLElement>(null);

    useEffect(() => {
        registerItem(itemRef, disabled);
        return () => unregisterItem(itemRef);
    }, [disabled]);

    const index = items.findIndex((i) => i.ref === itemRef);
    const isFocused = focusedIndex === index;

    return (
        <div
            ref={(node) => {
                itemRef.current = node;
                if (forwardedRef && typeof forwardedRef !== "function") {
                    (
                        forwardedRef as React.RefObject<HTMLElement | null>
                    ).current = node;
                }
            }}
            role="menuitem"
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : isFocused ? 0 : -1}
            data-disabled={disabled ? "disabled" : undefined}
            className={cn(
                "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
                "data-[disabled]:pointer-events-none",
                "data-[disabled]:opacity-50",
                "data-[inset]:pl-8 [&_svg]:pointer-events-none",
                "data-[variant=destructive]:text-destructive",
                "data-[variant=destructive]:focus:bg-destructive/10",
                "dark:data-[variant=destructive]:focus:bg-destructive/20",
                "data-[variant=destructive]:focus:text-destructive",
                "data-[variant=destructive]:*:[svg]:!text-destructive",
                "[&_svg]:shrink-0",
                "[&_svg:not([class*='size-'])]:size-4",
                "[&_svg:not([class*='text-'])]:text-muted-foreground",
                className,
            )}
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault();
                    return;
                }
                onSelect?.();
                // setOpen(false);
                triggerRef.current?.focus();
            }}
            onMouseEnter={() => {
                if (!disabled && !isKeyboardNav) {
                    focusItem(index);
                }
            }}
            {...rest}
        >
            {children}
        </div>
    );
});
