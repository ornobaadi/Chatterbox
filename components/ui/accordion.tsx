'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
}

export function Accordion({
  type = 'single',
  defaultValue,
  className,
  children,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    if (!defaultValue) return new Set();
    if (Array.isArray(defaultValue)) return new Set(defaultValue);
    return new Set([defaultValue]);
  });

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        const next = new Set(type === 'single' ? [] : prev);
        if (prev.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return next;
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  return (
    <div
      data-item-value={value}
      className={cn(
        'rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { itemValue: value });
        }
        return child;
      })}
    </div>
  );
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  itemValue?: string;
}

export function AccordionTrigger({
  itemValue,
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  if (!context || !itemValue) return null;

  const isOpen = context.openItems.has(itemValue);

  return (
    <button
      type="button"
      onClick={() => context.toggleItem(itemValue)}
      className={cn(
        'flex w-full items-center justify-between p-5 text-left font-semibold text-sm transition-all hover:bg-muted/40 cursor-pointer',
        isOpen && 'bg-muted/30',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
          isOpen && 'rotate-180 text-primary'
        )}
      />
    </button>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  itemValue?: string;
}

export function AccordionContent({
  itemValue,
  className,
  children,
  ...props
}: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  if (!context || !itemValue) return null;

  const isOpen = context.openItems.has(itemValue);
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-50 duration-200 border-t border-border/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
