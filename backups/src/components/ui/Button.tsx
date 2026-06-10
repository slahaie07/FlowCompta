import { motion, HTMLMotionProps } from 'motion/react';
import React from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, asChild, children, ...props }, ref) => {
    const Component = asChild ? Slot : motion.button;
    
    const baseStyles = "inline-flex items-center justify-center rounded-2xl font-medium transition-all focus:outline-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-sapphire to-sapphire-light text-white shadow-lg shadow-sapphire/20",
      secondary: "glass-button text-silver border-white/10 hover:bg-white/5",
      gold: "bg-gradient-to-r from-gold to-gold-dark text-midnight shadow-lg shadow-gold/20",
      ghost: "text-slate-400 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    const combinedProps = asChild ? props : {
      whileHover: { y: -1 },
      whileTap: { scale: 0.98 },
      ...props
    };

    return (
      <Component
        ref={ref as any}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading}
        {...combinedProps}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';
