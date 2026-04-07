import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  {
    variants: {
      variant: {
        default:
          'bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] text-white shadow-[0_16px_40px_rgba(56,115,184,0.22)] hover:-translate-y-0.5 hover:shadow-[0_22px_46px_rgba(56,115,184,0.28)]',
        secondary:
          'border border-[color:var(--border)] bg-white/80 text-slate-800 shadow-[0_10px_26px_rgba(148,163,184,0.16)] hover:bg-white',
        ghost: 'text-slate-700 hover:bg-white/70',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        lg: 'h-12 px-6 text-[15px]',
        sm: 'h-9 px-4 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
