import { Separator } from '@/components/ui/separator'

type PageShellProps = {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function PageShell({ title, description, action, children }: PageShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <Separator />
      {children}
    </div>
  )
}
