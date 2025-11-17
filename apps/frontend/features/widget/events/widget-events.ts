/**
 * Widget Event Bus
 * Allows other parts of the app to trigger widget actions
 * (e.g., auto-open chat when customer accepts provider)
 */

type WidgetEventType = 'open-thread-for-order'

interface WidgetEventData {
  'open-thread-for-order': {
    orderId: string
    requestDisplayId: string
  }
}

type WidgetEventListener<T extends WidgetEventType> = (
  data: WidgetEventData[T]
) => void

class WidgetEventBus {
  private listeners: Map<
    WidgetEventType,
    Set<WidgetEventListener<any>>
  > = new Map()

  /**
   * Subscribe to a widget event
   */
  on<T extends WidgetEventType>(
    event: T,
    listener: WidgetEventListener<T>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(listener)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(listener)
    }
  }

  /**
   * Emit a widget event
   */
  emit<T extends WidgetEventType>(event: T, data: WidgetEventData[T]): void {
    const eventListeners = this.listeners.get(event)

    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data)
        } catch (error) {
          console.error(`[WidgetEventBus] Error in ${event} listener:`, error)
        }
      })
    }
  }

  /**
   * Clear all listeners for an event
   */
  clear(event?: WidgetEventType): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Export singleton instance
export const widgetEventBus = new WidgetEventBus()

/**
 * Helper function to open widget chat for a specific order
 * Call this when customer accepts a provider
 */
export function openWidgetForOrder(
  orderId: string,
  requestDisplayId: string
): void {
  widgetEventBus.emit('open-thread-for-order', {
    orderId,
    requestDisplayId,
  })
}
