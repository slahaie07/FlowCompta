import { motion } from 'motion/react';
import React from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, asChild, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-2xl font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-gold to-gold-dark text-noir shadow-lg shadow-gold/20 hover:brightness-110",
      secondary: "glass-button text-silver border-white/10 hover:bg-white/5",
      gold: "bg-gradient-to-r from-gold to-gold-dark text-noir shadow-lg shadow-gold/20 hover:brightness-110",
      ghost: "text-slate-400 hover:text-ivoire hover:bg-white/5",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
      icon: "p-3",
    };

    const content = (
      <>
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children as React.ReactNode}
      </>
    );

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLButtonElement>}
          className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
          {...props}
        >
          {content}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
