"use client";

import React from 'react';
import {
    Slider as AriaSliderRoot,
    SliderProps as AriaSliderProps,
    SliderOutput,
    SliderThumb,
    SliderTrack,
    Label,
    composeRenderProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { twMerge } from 'tailwind-merge';

// Helper to compose tailwind classes with react-aria render props
export function composeTailwindRenderProps<T>(className: string | ((v: T) => string) | undefined, tailwind: string): string | ((v: T) => string) {
    return composeRenderProps(className, (className) => twMerge(tailwind, className));
}

// Focus ring style
export const focusRing = tv({
    base: 'outline-none',
    variants: {
        isFocusVisible: {
            true: 'ring-2 ring-[#3f52ff] ring-offset-2'
        }
    }
});

const trackStyles = tv({
    base: 'rounded-full relative',
    variants: {
        orientation: {
            horizontal: 'w-full h-1',
            vertical: 'h-full w-1 ml-[50%] -translate-x-[50%]'
        },
        isDisabled: {
            false: 'bg-[#eceff2] dark:bg-neutral-800',
            true: 'bg-neutral-200 dark:bg-neutral-900'
        }
    }
});

const fillStyles = tv({
    base: 'absolute rounded-full pointer-events-none',
    variants: {
        orientation: {
            horizontal: 'h-1',
            vertical: 'w-1 bottom-0 left-0'
        },
        isDisabled: {
            false: 'bg-[#3f52ff]',
            true: 'bg-neutral-400'
        }
    }
});

const thumbStyles = tv({
    extend: focusRing,
    base: 'w-4 h-4 rounded-full bg-white border-2 border-[#3f52ff] shadow-sm cursor-pointer transition-transform hover:scale-110 active:scale-95 top-[50%]',
    variants: {
        isDragging: {
            true: 'scale-110'
        },
        isDisabled: {
            true: 'border-neutral-300'
        }
    }
});

export interface SliderProps<T> extends AriaSliderProps<T> {
    label?: string;
    thumbLabels?: string[];
    unit?: string;
}

export function AriaSlider<T extends number | number[]>(
    { label, thumbLabels, unit, ...props }: SliderProps<T>
) {
    return (
        <AriaSliderRoot
            {...props}
            className={composeTailwindRenderProps(props.className, 'flex flex-col gap-2 w-full')}
        >
            <div className="flex items-center justify-between w-full">
                {label && <Label className="text-sm font-semibold text-[#22292f] select-none">{label}</Label>}
                <SliderOutput className="text-sm font-medium text-[#668091] select-none">
                    {({ state }) => (
                        <>
                            {state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
                            {unit && <span className="ml-1 text-[#859bab] font-normal">{unit}</span>}
                        </>
                    )}
                </SliderOutput>
            </div>

            <SliderTrack className="group relative flex items-center h-5 w-full touch-none">
                {({ state, ...renderProps }) => {
                    const isHorizontal = state.orientation === 'horizontal';
                    return (
                        <>
                            <div className={trackStyles(renderProps)} />
                            {state.values.map((_, i) => {
                                const percent = state.getThumbPercent(i) * 100;
                                return (
                                    <React.Fragment key={i}>
                                        {/* Fill layer for the first thumb (from start to thumb) */}
                                        {i === 0 && (
                                            <div
                                                className={fillStyles(renderProps)}
                                                style={{
                                                    width: isHorizontal ? `${percent}%` : '100%',
                                                    height: isHorizontal ? undefined : `${percent}%`,
                                                    left: 0,
                                                    bottom: isHorizontal ? undefined : 0
                                                }}
                                            />
                                        )}
                                        <SliderThumb
                                            index={i}
                                            aria-label={thumbLabels?.[i]}
                                            className={thumbStyles(renderProps)}
                                            style={{
                                                transform: isHorizontal ? 'translate(-50%, -50%)' : 'translate(-50%, 50%)'
                                            }}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </>
                    );
                }}
            </SliderTrack>
        </AriaSliderRoot>
    );
}
