import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  delta?: { value: number; label: string }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success-100 text-success-500',
  warning: 'bg-warning-100 text-warning-500',
  danger: 'bg-danger-100 text-danger-500',
}

export function StatCard({ label, value, icon: Icon, delta, variant = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn('rounded-lg p-2.5', variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {delta && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {delta.value >= 0 ? (
              <TrendingUp className="h-3 w-3 text-success-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-danger-500" />
            )}
            <span className={delta.value >= 0 ? 'text-success-500' : 'text-danger-500'}>
              {delta.value > 0 ? '+' : ''}{delta.value}%
            </span>
            <span className="text-muted-foreground">{delta.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
