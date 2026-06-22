import { motion, HTMLMotionProps } from 'motion/react';
import React from 'react';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'borderless' | 'panel';
  glow?: 'none' | 'gold' | 'sapphire';
  withAurora?: boolean;
}

export const Card = ({ 
  className = '', 
  variant = 'glass', 
  glow = 'none', 
  withAurora = false,
  children, 
  ...props 
}: CardProps) => {
  const baseStyles = "rounded-3xl overflow-hidden transition-all duration-500 relative group";
  
  const variants = {
    default: "bg-obsidian border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
    glass: "glass-card",
    panel: "glass-panel",
    borderless: "bg-transparent"
  };

  const glows = {
    none: "",
    gold: "shadow-[0_0_30px_rgba(212,175,55,0.05)] border-gold/10",
    sapphire: "shadow-[0_0_30px_rgba(15,82,186,0.05)] border-sapphire/10"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${baseStyles} ${variants[variant]} ${glows[glow]} ${className}`}
      {...props}
    >
      {withAurora && <div className="aurora-bg opacity-30" />}
      <div className="relative z-10">
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
};
