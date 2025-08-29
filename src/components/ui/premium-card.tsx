import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface PremiumCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'glass'
  hover?: boolean
  icon?: React.ReactNode
  title?: string
  subtitle?: string
  interactive?: boolean
}

export function PremiumCard({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  icon,
  title,
  subtitle,
  interactive = false,
  ...props 
}: PremiumCardProps) {
  const baseClasses = cn(
    "relative overflow-hidden rounded-2xl border transition-all duration-300",
    "backdrop-blur-sm",
    hover && !interactive && "hover:scale-[1.02] hover:shadow-2xl",
    interactive && "cursor-pointer hover:shadow-xl",
    className
  )

  const variantClasses = {
    default: cn(
      "bg-card/50 border-border/50",
      "hover:bg-card/80 hover:border-border/80",
      "dark:bg-card/30 dark:border-border/30",
      "dark:hover:bg-card/50 dark:hover:border-border/50",
      "shadow-sm hover:shadow-lg"
    ),
    gradient: cn(
      "bg-gradient-to-br from-card/80 via-card/60 to-card/40 border-border/50",
      "hover:from-card/90 hover:via-card/70 hover:to-card/50 hover:border-border/80",
      "dark:from-card/40 dark:via-card/20 dark:to-card/10 dark:border-border/30",
      "dark:hover:from-card/60 dark:hover:via-card/40 dark:hover:to-card/20 dark:hover:border-border/50",
      "shadow-lg hover:shadow-xl"
    ),
    glass: cn(
      "bg-white/10 border-white/20",
      "backdrop-blur-md",
      "hover:bg-white/15 hover:border-white/30",
      "dark:bg-black/20 dark:border-white/10",
      "dark:hover:bg-black/30 dark:hover:border-white/20",
      "shadow-lg hover:shadow-xl"
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(baseClasses, variantClasses[variant])}
      {...props}
    >
      {/* Background Pattern (very subtle) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01),transparent_50%)]" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {(icon || title || subtitle) && (
          <div className="mb-4 flex items-start gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                {icon}
              </div>
            )}
            {(title || subtitle) && (
              <div className="flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  )
}
