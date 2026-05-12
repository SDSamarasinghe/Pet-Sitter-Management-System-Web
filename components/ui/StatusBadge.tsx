import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  status: string
  type?: 'booking' | 'user' | 'payment'
}

const bookingStyles: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-500 border-warning-500/20',
  confirmed: 'bg-success-100 text-success-500 border-success-500/20',
  assigned: 'bg-blue-100 text-blue-700 border-blue-700/20',
  in_progress: 'bg-sky-100 text-sky-700 border-sky-700/20',
  completed: 'bg-secondary text-secondary-foreground',
  cancelled: 'bg-danger-100 text-danger-500 border-danger-500/20',
}

const userStyles: Record<string, string> = {
  active: 'bg-success-100 text-success-500 border-success-500/20',
  pending: 'bg-warning-100 text-warning-500 border-warning-500/20',
  rejected: 'bg-danger-100 text-danger-500 border-danger-500/20',
}

const paymentStyles: Record<string, string> = {
  pending: 'bg-warning-100 text-warning-500 border-warning-500/20',
  partial: 'bg-orange-100 text-orange-700 border-orange-700/20',
  paid: 'bg-success-100 text-success-500 border-success-500/20',
  refunded: 'bg-secondary text-secondary-foreground',
}

const styleMap = {
  booking: bookingStyles,
  user: userStyles,
  payment: paymentStyles,
}

export function StatusBadge({ status, type = 'booking' }: StatusBadgeProps) {
  const styles = styleMap[type]
  const statusKey = status.toLowerCase().replace(/\s+/g, '_')
  const style = styles[statusKey] || ''

  return (
    <Badge variant="outline" className={cn('capitalize', style)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
