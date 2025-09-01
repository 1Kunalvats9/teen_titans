import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
    switch (variant) {
      case 'destructive':
        sonnerToast.error(title || 'Error', {
          description,
        })
        break
      case 'success':
        sonnerToast.success(title || 'Success', {
          description,
        })
        break
      default:
        sonnerToast(title || 'Notification', {
          description,
        })
        break
    }
  }

  return { toast }
}
