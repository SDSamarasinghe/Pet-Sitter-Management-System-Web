'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Clock, Calendar, PawPrint, User, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

type Notification = {
  _id: string
  action: string
  category: string
  description: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, any>
}

type NotificationPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCountUpdate?: (count: number) => void
}

const categoryIcons: Record<string, ReactNode> = {
  booking: <Calendar className="h-4 w-4 text-blue-500" />,
  pet: <PawPrint className="h-4 w-4 text-amber-500" />,
  user: <User className="h-4 w-4 text-green-500" />,
  invoice: <FileText className="h-4 w-4 text-purple-500" />,
  report: <FileText className="h-4 w-4 text-orange-500" />,
  auth: <Shield className="h-4 w-4 text-red-500" />,
  system: <Bell className="h-4 w-4 text-gray-500" />,
  profile: <User className="h-4 w-4 text-teal-500" />,
}

const categoryColors: Record<string, string> = {
  booking: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
  pet: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
  user: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
  invoice: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
  report: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
  auth: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
  system: 'bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:border-gray-800',
  profile: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800',
}

export function NotificationPanel({ open, onOpenChange, onCountUpdate }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/activity-log/notifications?limit=30')
      setNotifications(data)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/activity-log/unread-count')
      onCountUpdate?.(data.count)
    } catch {
      // silent fail
    }
  }, [onCountUpdate])

  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const handleMarkAllRead = async () => {
    try {
      await api.put('/activity-log/mark-all-read')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      onCountUpdate?.(0)
    } catch {
      // silent fail
    }
  }

  const handleMarkRead = async (ids: string[]) => {
    try {
      await api.put('/activity-log/mark-read', { logIds: ids })
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n._id) ? { ...n, isRead: true } : n))
      )
      fetchUnreadCount()
    } catch {
      // silent fail
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 border-b space-y-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkRead([notification._id])
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${categoryColors[notification.category] || categoryColors.system}`}>
                      {categoryIcons[notification.category] || categoryIcons.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                          {notification.action}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1 capitalize">
                          {notification.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-3 text-center">
          <Button variant="ghost" size="sm" className="text-xs w-full" asChild>
            <Link href="/activity-log">View all activity</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
