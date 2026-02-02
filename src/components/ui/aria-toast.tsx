"use client";

import React, { CSSProperties } from 'react';
import {
    UNSTABLE_ToastRegion as ToastRegion,
    UNSTABLE_Toast as Toast,
    UNSTABLE_ToastQueue as ToastQueue,
    UNSTABLE_ToastContent as ToastContent,
    ToastProps,
    Button,
    Text
} from 'react-aria-components';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { flushSync } from 'react-dom';

// Define the type for your toast content
interface MyToastContent {
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'info';
    type?: 'success' | 'error' | 'info'; // Alias for backward compatibility
}

// This is a global toast queue, to be imported and called where ever you want to queue a toast via queue.add().
export const toastQueue = new ToastQueue<MyToastContent>({
    maxVisibleToasts: 5,
    // Wrap state updates in a CSS view transition.
    wrapUpdate(fn) {
        if (typeof document !== 'undefined' && 'startViewTransition' in document) {
            (document as any).startViewTransition(() => {
                flushSync(fn);
            });
        } else {
            fn();
        }
    }
});

export function GlobalToastRegion() {
    return (
        // The ToastRegion should be rendered at the root of your app.
        <ToastRegion
            queue={toastQueue}
            className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 outline-none"
        >
            {({ toast }) => (
                <MyToast toast={toast}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ToastIcon variant={toast.content.variant || toast.content.type || 'success'} />
                        <ToastContent className="flex flex-col flex-1 min-w-0 gap-0.5">
                            <Text slot="title" className="font-semibold text-[#22292f] text-sm">{toast.content.title}</Text>
                            {toast.content.description && (
                                <Text slot="description" className="text-sm text-[#516778]">{toast.content.description}</Text>
                            )}
                        </ToastContent>
                    </div>
                    <Button
                        slot="close"
                        aria-label="Close"
                        className="flex flex-none shrink-0 p-1 text-[#859bab] hover:bg-[#eceff2] rounded-lg transition-colors outline-none items-center justify-center"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </MyToast>
            )}
        </ToastRegion>
    );
}

function ToastIcon({ variant }: { variant: 'success' | 'error' | 'info' }) {
    if (variant === 'error') {
        return <AlertCircle className="w-5 h-5 text-[#e22023] shrink-0" />;
    }
    if (variant === 'info') {
        return <Info className="w-5 h-5 text-[#3f52ff] shrink-0" />;
    }
    // Default: success
    return <CheckCircle2 className="w-5 h-5 text-[#22892e] shrink-0" />;
}

export function MyToast(props: ToastProps<MyToastContent>) {
    return (
        <Toast
            {...props}
            style={{ viewTransitionName: props.toast.key } as CSSProperties}
            className="flex items-center gap-3 bg-white border border-[#d5dde2] shadow-lg rounded-xl px-4 py-3 min-w-[320px] max-w-[400px] outline-none [view-transition-class:toast] font-sans"
        />
    );
}
