"use client";

import { ToastQueue, useToastQueue } from "@react-stately/toast";
import { useToast, useToastRegion } from "@react-aria/toast";
import { Button } from "react-aria-components";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import React from "react";

export const toastQueue = new ToastQueue({
    maxVisibleToasts: 5,
});

function AriaToast({ toast, state }: { toast: any; state: any }) {
    let ref = React.useRef(null);
    let { toastProps, titleProps, descriptionProps, closeButtonProps } = useToast({ toast }, state, ref);

    // Safety check for toast content
    if (!toast || !toast.content) {
        return null;
    }

    let { title, description, variant, type } = toast.content;
    // Support both 'variant' and 'type' for backward compatibility
    let toastVariant = variant || type || "success";

    // Icon based on variant
    let icon = <CheckCircle2 className="w-5 h-5 text-[#22892e]" />; // Default success
    if (toastVariant === "error") icon = <AlertCircle className="w-5 h-5 text-[#e22023]" />;
    if (toastVariant === "info") icon = <Info className="w-5 h-5 text-[#3f52ff]" />;

    return (
        <div
            {...toastProps}
            ref={ref}
            className="group flex items-start gap-3 bg-white border border-[#d5dde2] shadow-lg rounded-xl p-4 min-w-[320px] max-w-[400px] transition-all data-[animation=entering]:translate-y-full data-[animation=exiting]:opacity-0 data-[animation=exiting]:scale-95"
            data-animation={toast.animation}
            onAnimationEnd={() => {
                if (toast.animation === 'exiting') {
                    state.remove(toast.key);
                }
            }}
        >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex flex-col flex-1 gap-1">
                <span {...titleProps} className="text-sm font-semibold text-[#22292f]">{title}</span>
                {description && <span {...descriptionProps} className="text-sm text-[#516778]">{description}</span>}
            </div>
            <Button
                {...closeButtonProps}
                className="shrink-0 p-1 text-[#859bab] hover:bg-[#eceff2] rounded-lg transition-colors outline-none"
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}

export function GlobalToastRegion() {
    let state = useToastQueue(toastQueue);
    let ref = React.useRef(null);
    let { regionProps } = useToastRegion({ 'aria-label': 'Notifications' }, state, ref);

    return (
        <div
            {...regionProps}
            ref={ref}
            className={`fixed bottom-6 right-6 z-[100] flex flex-col gap-3 outline-none ${state.visibleToasts.length > 0 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
            {state.visibleToasts.map((toast) => (
                <AriaToast key={toast.key} toast={toast} state={state} />
            ))}
        </div>
    );
}
