'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning'
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false
}: ConfirmationModalProps) {
  useEffect(() => {
    // This effect is intentionally empty - it's here for future use if needed
  }, [isOpen])

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
          confirmButton: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
          border: 'border-destructive/20'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
          confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          border: 'border-yellow-500/20'
        }
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-primary" />,
          confirmButton: 'bg-primary hover:bg-primary/90 text-primary-foreground',
          border: 'border-primary/20'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md mx-4"
          >
            <Card className={`bg-background/95 backdrop-blur-md border ${variantStyles.border} shadow-2xl`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {variantStyles.icon}
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {title}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {message}
                </p>
                
                <div className="flex items-center justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="border-border/50 hover:bg-muted/50"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={variantStyles.confirmButton}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Hook for easy usage
export function useConfirmationModal() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    variant: 'default' | 'destructive' | 'warning'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    onConfirm: () => {}
  })

  const openModal = (config: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive' | 'warning'
    onConfirm: () => void
  }) => {
    setModalState({
      isOpen: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      variant: config.variant || 'default',
      onConfirm: config.onConfirm
    })
  }

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  return {
    modalState,
    openModal,
    closeModal
  }
}
