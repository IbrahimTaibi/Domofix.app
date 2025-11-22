export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

export function canShowBrowserNotifications(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  return Notification.permission === 'granted'
}
