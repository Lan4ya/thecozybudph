import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    createContext,
} from "react";

interface DropdownMenuContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
    registerItem: (
        ref: React.RefObject<HTMLElement | null>,
        disabled?: boolean,
    ) => number;
    unregisterItem: (ref: React.RefObject<HTMLElement | null>) => void;
    focusItem: (index: number) => void;
    focusedIndex: number;
    items: Array<{ ref: React.RefObject<HTMLElement>; disabled?: boolean }>;
    isControlled: boolean;
    isKeyboardNav: boolean;
}

export const DropdownMenuContext = createContext<
    DropdownMenuContextValue | undefined
>(undefined);

export const DropdownMenu: React.FC<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    children: React.ReactNode;
    modal?: boolean;
}> = ({
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    children,
    modal = true,
}) => {
    const [openState, setOpenState] = useState(defaultOpen);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : openState;
    const setOpen = (o: boolean) => {
        if (!isControlled) setOpenState(o);
        onOpenChange?.(o);
    };

    const triggerRef = useRef<HTMLElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const [items, setItems] = useState<
        Array<{ ref: React.RefObject<HTMLElement>; disabled?: boolean }>
    >([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    const registerItem = useCallback(
        (ref: React.RefObject<HTMLElement | null>, disabled = false) => {
            setItems((prev) => {
                if (prev.find((i) => i.ref === ref)) return prev;
                return [
                    ...prev,
                    { ref: ref as React.RefObject<HTMLElement>, disabled },
                ];
            });
            return items.length;
        },
        [items],
    );

    const unregisterItem = useCallback(
        (ref: React.RefObject<HTMLElement | null>) => {
            setItems((prev) => prev.filter((i) => i.ref !== ref));
        },
        [],
    );

    const focusItem = (index: number) => {
        setFocusedIndex(index);
        const item = items[index];
        const el = item?.ref.current;
        if (el && !item.disabled) {
            el.focus({ preventScroll: true }); // disable default auto-scroll
            ensureVisible(el); // scroll smoothly only if the item's cut off
        }
    };

    // when the mouse is inside the dropdown content and ensureVisible() fires, it
    // scrolls the container causing mousemove/mouseover to fire too, stealing
    // the focus on the curr focused item if the mouse is on a non-disabled
    // item. this state is used to prevent mouseEnter from firing if true
    const [isKeyboardNav, setIsKeyboardNav] = useState(false);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (["ArrowDown", "ArrowUp"].includes(e.key))
                setIsKeyboardNav(true);
        };
        const handleMouseMove = () => setIsKeyboardNav(false);

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousemove", handleMouseMove);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    // handle keyboard navigation
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (!contentRef.current) return;
            switch (e.key) {
                case "ArrowDown": {
                    e.preventDefault();
                    let next = focusedIndex + 1;
                    while (next < items.length && items[next].disabled) {
                        next++;
                    }
                    if (next < items.length) {
                        focusItem(next);
                    }
                    break;
                }
                case "ArrowUp": {
                    e.preventDefault();
                    let prev = focusedIndex - 1;
                    while (prev >= 0 && items[prev].disabled) {
                        prev--;
                    }
                    if (prev >= 0) {
                        focusItem(prev);
                    }
                    break;
                }
                case "Enter":
                    const curr = items[focusedIndex];
                    if (!curr || curr.disabled) return;
                    e.preventDefault();
                    curr.ref.current?.click();
                    break;
                case "Escape":
                    e.preventDefault();
                    setOpen(false);
                    triggerRef.current?.focus();
                    break;
                case "Home": {
                    e.preventDefault();
                    const first = items.findIndex((i) => !i.disabled);
                    if (first >= 0) focusItem(first);
                    break;
                }
                case "End": {
                    e.preventDefault();
                    const revIdx = items
                        .slice()
                        .reverse()
                        .findIndex((i) => !i.disabled);
                    if (revIdx >= 0) {
                        const origIdx = items.length - 1 - revIdx;
                        focusItem(origIdx);
                    }
                    break;
                }
            }
        };

        contentRef.current?.addEventListener("keydown", onKeyDown);
        return () => {
            contentRef.current?.removeEventListener("keydown", onKeyDown);
        };
    }, [open, items, focusedIndex]);

    // handle click & focusin
    useEffect(() => {
        if (!open || !modal) return;
        function handleClickAndFocusIn(e: MouseEvent | FocusEvent) {
            if (
                contentRef.current?.contains(e.target as Node) ||
                triggerRef.current?.contains(e.target as Node)
            ) {
                return;
            }
            setOpen(false);
        }

        document.addEventListener("mousedown", handleClickAndFocusIn);
        document.addEventListener("focusin", handleClickAndFocusIn);

        return () => {
            document.removeEventListener("mousedown", handleClickAndFocusIn);
            document.removeEventListener("focusin", handleClickAndFocusIn);
        };
    }, [open, modal]);

    return (
        <DropdownMenuContext.Provider
            value={{
                open,
                setOpen,
                triggerRef,
                contentRef,
                registerItem,
                unregisterItem,
                focusedIndex,
                focusItem,
                items,
                isControlled,
                isKeyboardNav,
            }}
        >
            {children}
        </DropdownMenuContext.Provider>
    );
};

const ensureVisible = (el: HTMLElement) => {
    const parent = el.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (elRect.top < parentRect.top) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else if (elRect.bottom > parentRect.bottom) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
};
