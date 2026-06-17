import { motion } from 'motion/react';

interface OrganicLoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OrganicLoader({ label = "C", size = "md" }: OrganicLoaderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-28 h-28 text-xl',
    lg: 'w-40 h-40 text-3xl'
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Blob */}
      <div 
        className={`absolute rounded-full border border-gold/20 bg-gold/[0.03] filter blur-[1px] animate-organic ${sizeClasses[size]}`}
      />
      
      {/* Inner Blob */}
      <div 
        className={`absolute rounded-full border border-gold/40 bg-gradient-to-tr from-gold/10 to-transparent shadow-[inset_0_0_25px_rgba(198,161,91,0.15)] animate-organic-reverse ${sizeClasses[size]}`}
      />
      
      {/* Central Brand Letter or Label */}
      <motion.div 
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.97, 1.03, 0.97] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative font-serif font-bold text-gold tracking-[0.2em] translate-x-[0.1em] text-center"
      >
        {label}
      </motion.div>
    </div>
  );
}
