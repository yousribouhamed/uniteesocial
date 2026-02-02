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

// Get dynamic colors based on variant
function getToastColors(variant: 'success' | 'error' | 'info') {
    switch (variant) {
        case 'success':
            return {
                bg: 'bg-[#16a34a]', // Green
                icon: <CheckCircle2 className="w-5 h-5 text-white shrink-0" />,
            };
        case 'error':
            return {
                bg: 'bg-[#dc2626]', // Red
                icon: <AlertCircle className="w-5 h-5 text-white shrink-0" />,
            };
        case 'info':
        default:
            return {
                bg: 'bg-[#3f52ff]', // Blue
                icon: <Info className="w-5 h-5 text-white shrink-0" />,
            };
    }
}

export function GlobalToastRegion() {
    return (
        // The ToastRegion should be rendered at the root of your app.
        <ToastRegion
            queue={toastQueue}
            className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 outline-none"
        >
            {({ toast }) => {
                const variant = toast.content.variant || toast.content.type || 'success';
                const { bg, icon } = getToastColors(variant);

                return (
                    <MyToast toast={toast} bgColor={bg}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {icon}
                            <ToastContent className="flex flex-col flex-1 min-w-0 gap-0.5">
                                <Text slot="title" className="font-semibold text-white text-sm">{toast.content.title}</Text>
                                {toast.content.description && (
                                    <Text slot="description" className="text-sm text-white/90">{toast.content.description}</Text>
                                )}
                            </ToastContent>
                        </div>
                        <Button
                            slot="close"
                            aria-label="Close"
                            className="flex flex-none shrink-0 p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors outline-none items-center justify-center"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </MyToast>
                );
            }}
        </ToastRegion>
    );
}

export function MyToast({ bgColor, ...props }: ToastProps<MyToastContent> & { bgColor: string }) {
    return (
        <Toast
            {...props}
            style={{ viewTransitionName: props.toast.key } as CSSProperties}
            className={`flex items-center gap-3 ${bgColor} shadow-lg rounded-xl px-4 py-3 min-w-[280px] max-w-[400px] outline-none [view-transition-class:toast] font-sans transition-all`}
        />
    );
}
