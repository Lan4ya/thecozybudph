import { DropdownMenuContext } from "./DropdownMenu";
import React, { useContext, forwardRef, useEffect } from "react";

export const DropdownMenuTrigger = forwardRef<
    HTMLElement,
    React.PropsWithChildren<
        {
            asChild?: boolean;
            asControlled?: boolean;
        } & React.HTMLAttributes<HTMLElement>
    >
>((props, forwardedRef) => {
    const ctx = useContext(DropdownMenuContext);
    if (!ctx) throw new Error("DropdownMenuTrigger used outside DropdownMenu");

    const { open, setOpen, triggerRef, focusItem, items, isControlled } = ctx;
    const { asChild = false, asControlled = false, children, ...rest } = props;

    // let the trigger be controllable given the dropdown menu root/context is also controllable
    const isTriggerControlled = asControlled && isControlled ? true : false;

    useEffect(() => {
        // if (!open) return;

        const triggerEl = triggerRef.current;
        if (!triggerEl) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();

                const first = items.findIndex((i) => !i.disabled);
                const last = () => {
                    // Prefer findLastIndex if environment supports it
                    // (Node 20+, latest browsers)
                    const anyItems = ctx.items as any;
                    if (typeof anyItems.findLastIndex === "function") {
                        return anyItems.findLastIndex((i: any) => !i.disabled);
                    }

                    // fallback: reverse + convert index back into original coordinates
                    const rev = ctx.items
                        .slice()
                        .reverse()
                        .findIndex((i) => !i.disabled);
                    const noItems = -1;
                    return rev === noItems
                        ? noItems
                        : ctx.items.length - 1 - rev;
                };

                focusItem(e.key === "ArrowDown" ? first : last());
            }
        };

        triggerEl.addEventListener("keydown", onKeyDown);
        return () => triggerEl.removeEventListener("keydown", onKeyDown);
    }, [open, items, focusItem, setOpen]);

    // cb helper to set both internal ref and forwardedRef
    const setRefs = (node: HTMLElement | null) => {
        triggerRef.current = node ?? null;
        if (!forwardedRef) return;
        if (typeof forwardedRef === "function") {
            forwardedRef(node);
        } else {
            (forwardedRef as React.RefObject<HTMLElement | null>).current =
                node;
        }
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            ref: setRefs,
            onClick: (e: React.MouseEvent) => {
                if (!isTriggerControlled) setOpen(!open);
                if ((children as any).props.onClick) {
                    (children as any).props.onClick(e);
                }
            },
            "aria-haspopup": "menu",
            "aria-expanded": open,
            ...rest,
        });
    }

    return (
        <button
            ref={setRefs}
            onClick={() => !isTriggerControlled && setOpen(!open)}
            aria-haspopup="menu"
            aria-expanded={open}
            {...rest}
        >
            {children}
        </button>
    );
});
