"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppLocale, LOCALE_STORAGE_KEY, normalizeForLookup, translateString } from "@/lib/locale";

type LocaleContextValue = {
  locale: AppLocale;
  isArabic: boolean;
  setLocale: (locale: AppLocale) => void;
  t: (text: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title", "alt"] as const;
const originalTextContent = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function shouldSkipNode(element: Element | null) {
  if (!element) return true;
  if (element.closest("[data-no-translate='true']")) return true;
  return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(element.tagName);
}

function updateTextNode(node: Text, locale: AppLocale) {
  if (shouldSkipNode(node.parentElement)) return;

  const currentValue = node.nodeValue ?? "";
  const originalValue = originalTextContent.get(node) ?? currentValue;

  if (!originalTextContent.has(node)) {
    originalTextContent.set(node, currentValue);
  }

  if (locale === "ar") {
    node.nodeValue = translateString(originalValue, locale);
    return;
  }

  const translatedOriginal = translateString(originalValue, "ar");
  if (normalizeForLookup(currentValue) === normalizeForLookup(translatedOriginal)) {
    node.nodeValue = originalValue;
    return;
  }

  originalTextContent.set(node, currentValue);
}

function updateElementAttributes(element: Element, locale: AppLocale) {
  if (shouldSkipNode(element)) return;

  const savedAttributes = originalAttributes.get(element) ?? new Map<string, string>();

  TRANSLATABLE_ATTRIBUTES.forEach((attributeName) => {
    if (!element.hasAttribute(attributeName)) return;

    if (!savedAttributes.has(attributeName)) {
      savedAttributes.set(attributeName, element.getAttribute(attributeName) ?? "");
    }

    const originalValue = savedAttributes.get(attributeName) ?? "";
    const currentValue = element.getAttribute(attributeName) ?? "";

    if (locale === "ar") {
      element.setAttribute(attributeName, translateString(originalValue, locale));
      return;
    }

    const translatedOriginal = translateString(originalValue, "ar");
    if (normalizeForLookup(currentValue) === normalizeForLookup(translatedOriginal)) {
      element.setAttribute(attributeName, originalValue);
      return;
    }

    savedAttributes.set(attributeName, currentValue);
  });

  if (savedAttributes.size > 0) {
    originalAttributes.set(element, savedAttributes);
  }
}

function translateDomTree(root: ParentNode, locale: AppLocale) {
  if (typeof document === "undefined") return;

  const rootElement = root instanceof Element ? root : null;
  if (rootElement) {
    updateElementAttributes(rootElement, locale);
  }

  if ("querySelectorAll" in root) {
    root.querySelectorAll("*").forEach((element) => {
      updateElementAttributes(element, locale);
    });
  }

  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentNode = textWalker.nextNode();

  while (currentNode) {
    updateTextNode(currentNode as Text, locale);
    currentNode = textWalker.nextNode();
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");
  const frameRef = useRef<number | null>(null);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale === "ar" || storedLocale === "en") {
      setLocaleState(storedLocale);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    const html = document.documentElement;
    html.lang = locale === "ar" ? "ar" : "en";
    html.dir = locale === "ar" ? "rtl" : "ltr";
    html.dataset.locale = locale;
  }, [locale]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const scheduleTranslation = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        translateDomTree(document.body, locale);
      });
    };

    scheduleTranslation();

    const observer = new MutationObserver(() => {
      scheduleTranslation();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });

    return () => {
      observer.disconnect();
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isArabic: locale === "ar",
      setLocale,
      t: (text: string) => translateString(text, locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  return context;
}
