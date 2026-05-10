'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  PawPrint,
  FileText,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Receipt,
  Shield,
  CalendarPlus,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export type SidebarUser = {
  firstName: string
  lastName: string
  role: string
  avatarUrl?: string
}

type SidebarProps = {
  user: SidebarUser
  onLogout: () => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Admin Panel', href: '/admin', icon: Shield },
    { label: 'Bookings', href: '/bookings', icon: Calendar },
    { label: 'Reports', href: '/reports', icon: FileText },
  ],
  sitter: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Schedule', href: '/scheduling', icon: Calendar },
    { label: 'My Clients', href: '/dashboard?tab=clients', icon: Users },
    { label: 'Reports', href: '/reports', icon: ClipboardList },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ],
  client: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Book Now', href: '/book-now', icon: CalendarPlus },
    { label: 'My Pets', href: '/pets', icon: PawPrint },
    { label: 'Bookings', href: '/bookings', icon: Calendar },
    { label: 'Invoices', href: '/invoices', icon: Receipt },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ],
}

function SidebarNav({
  items,
  collapsed,
  onNavigate,
}: {
  items: NavItem[]
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-1 px-2">
        {items.map((item) => {
          const basePath = item.href.split('?')[0]
          const isActive = pathname === basePath || pathname.startsWith(basePath + '/')

          const Icon = item.icon

          const linkEl = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkEl}</div>
        })}
      </nav>
    </TooltipProvider>
  )
}

function SidebarContent({
  user,
  collapsed,
  onCollapse,
  onLogout,
  onNavigate,
}: {
  user: SidebarUser
  collapsed: boolean
  onCollapse?: () => void
  onLogout: () => void
  onNavigate?: () => void
}) {
  const items = navItemsByRole[user.role] || navItemsByRole.client

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            Whiskarz
          </Link>
        )}
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onCollapse}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav items={items} collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {/* User Card */}
      <Separator />
      <div className="p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
            <AvatarFallback className="text-xs">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <Badge variant="outline" className="mt-0.5 text-xs capitalize">
                {user.role}
              </Badge>
            </div>
          )}
          {!collapsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ user, onLogout, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored !== null) setCollapsed(stored === 'true')
  }, [])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar-collapsed', String(next))
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden border-r bg-background transition-all duration-200 lg:block',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          user={user}
          collapsed={collapsed}
          onCollapse={toggleCollapse}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            user={user}
            collapsed={false}
            onLogout={onLogout}
            onNavigate={() => onMobileOpenChange?.(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
