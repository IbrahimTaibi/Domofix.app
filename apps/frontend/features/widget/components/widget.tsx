"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { useWidgetStore } from "@/features/widget/store/widget-store";
import { useMessagesStore } from "@/features/widget/store/messages-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useWidgetSocket } from "@/features/widget/hooks/useWidgetSocket";
import { widgetEventBus } from "@/features/widget/events/widget-events";
import BottomNav from "@/features/widget/components/bottom-nav";
import ChatComposer from "@/features/widget/components/messages/chat-composer";
import HomeScreen from "@/features/widget/components/screens/home-screen";
import MessagesScreen from "@/features/widget/components/screens/messages-screen";
import HelpScreen from "@/features/widget/components/screens/help-screen";
import { MessageCircle, X, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Widget() {
  const open = useWidgetStore((s) => s.open);
  const setOpen = useWidgetStore((s) => s.setOpen);
  const tab = useWidgetStore((s) => s.tab);
  const setTab = useWidgetStore((s) => s.setTab);

  // Auth
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Messages
  const activeThreadId = useMessagesStore((s) => s.activeThreadId);
  const threads = useMessagesStore((s) => s.threads);
  const backToList = useMessagesStore((s) => s.backToList);
  const loadThreads = useMessagesStore((s) => s.loadThreads);
  const sendMessage = useMessagesStore((s) => s.sendMessage);
  const addIncomingMessage = useMessagesStore((s) => s.addIncomingMessage);
  const markAsRead = useMessagesStore((s) => s.markAsRead);
  const isSending = useMessagesStore((s) => s.isSending);

  // Socket.IO for real-time updates
  const { joinThread, leaveThread } = useWidgetSocket({
    enabled: !!user,
    onNewMessage: useCallback((payload: { threadId: string; message: any }) => {
      addIncomingMessage(payload, user?.id || null);
    }, [addIncomingMessage, user?.id]),
    onMessageRead: markAsRead,
  });

  // Load threads on mount (only if authenticated)
  useEffect(() => {
    if (user?.id) {
      loadThreads(user.id);
    }
  }, [user?.id, loadThreads]);

  // Clear active thread when widget is closed to allow badge updates
  useEffect(() => {
    if (!open && activeThreadId) {
      backToList();
    }
  }, [open, activeThreadId, backToList]);

  // Memoize thread IDs for dependency tracking
  const threadIds = useMemo(() => threads.map(t => t.id).join(','), [threads]);

  // Join ALL thread rooms to receive notifications (even when widget is closed)
  useEffect(() => {
    if (!user?.id || threads.length === 0) return;

    // Join all thread rooms (including active thread)
    threads.forEach((thread) => {
      joinThread(thread.id);
    });

    // Leave all thread rooms on unmount
    return () => {
      threads.forEach((thread) => {
        leaveThread(thread.id);
      });
    };
  }, [threadIds, threads, joinThread, leaveThread, user?.id]);

  // Listen for auto-open events (e.g., when customer accepts provider)
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = widgetEventBus.on(
      'open-thread-for-order',
      async (data: { orderId: string; requestDisplayId: string }) => {
        // Open widget
        setOpen(true);
        // Switch to messages tab
        useWidgetStore.getState().setTab('messages');
        // Open the thread for this order
        await useMessagesStore.getState().openThreadForOrder(data.orderId, data.requestDisplayId, user.id);
      }
    );

    return () => unsubscribe();
  }, [user?.id, setOpen]);

  // Calculate total unread count
  const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  // Memoize active thread data for header
  const activeThreadData = useMemo(() => {
    if (!activeThreadId) return null;
    const thread = threads.find((t) => t.id === activeThreadId);
    if (!thread) return null;
    const otherParticipant = thread.participants.find((p) => p.id !== user?.id);
    const initial = (otherParticipant?.name || "U").charAt(0).toUpperCase();
    return { thread, otherParticipant, initial };
  }, [activeThreadId, threads, user?.id]);

  // Handle widget open - switch to messages tab if there are unread messages
  const handleWidgetOpen = useCallback(() => {
    if (totalUnread > 0) {
      setTab('messages');
    }
    setOpen(true);
  }, [totalUnread, setTab, setOpen]);

  // Don't render widget if not authenticated
  if (!user || isLoading) {
    return null;
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          aria-label="Ouvrir le widget"
          onClick={handleWidgetOpen}
          className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg ring-4 ring-white/40 hover:bg-primary-700">
          <MessageCircle className="h-6 w-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      ) : null}
      {open ? (
        <div className="fixed z-50 inset-0 md:inset-auto md:bottom-4 md:right-4 w-full h-full md:w-[360px] md:h-[680px] md:max-w-[92vw] rounded-none md:rounded-xl border-0 md:border bg-white shadow-none md:shadow-2xl flex flex-col">
          {tab !== "home" ? (
            <div className="px-3 py-2 bg-white border-b flex-shrink-0">
              {tab === "messages" && activeThreadId ? (
                <div className="grid grid-cols-3 items-center">
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Retour"
                      onClick={backToList}
                      className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100">
                      <ChevronLeft className="h-4 w-4 text-gray-700" />
                    </button>
                    <span className="h-5 w-5 rounded-full overflow-hidden flex items-center justify-center">
                      {activeThreadData?.otherParticipant?.avatarUrl ? (
                        <img
                          src={activeThreadData.otherParticipant.avatarUrl}
                          alt={activeThreadData.otherParticipant.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="h-full w-full rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-medium">
                          {activeThreadData?.initial}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 text-center">
                    <span className="block text-sm font-semibold text-gray-900 truncate whitespace-nowrap">
                      {activeThreadData?.thread.title || "Conversation"}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      aria-label="Fermer"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100">
                      <X className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 items-center">
                  <div />
                  <div className="text-sm font-semibold text-center text-gray-900">
                    {tab === "messages" ? "Messages" : "Aide"}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      aria-label="Fermer"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100">
                      <X className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          <div className="flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">
              {tab === "home" ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="relative bg-white min-h-full">
                  <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-600 via-primary-300 to-white pointer-events-none z-0" />
                  <button
                    type="button"
                    aria-label="Fermer"
                    onClick={() => setOpen(false)}
                    className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded hover:bg-white/10 text-white z-20 pointer-events-auto">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <HomeScreen />
                  </div>
                </motion.div>
              ) : tab === "messages" ? (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full">
                  <MessagesScreen />
                </motion.div>
              ) : (
                <motion.div
                  key="help"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full">
                  <HelpScreen />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {tab === "messages" && activeThreadId ? (
              <motion.div
                key="composer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white border-t flex-shrink-0 overflow-hidden">
                <ChatComposer
                  onSend={sendMessage}
                  isSending={isSending}
                  isReadOnly={threads.find((t) => t.id === activeThreadId)?.isReadOnly}
                />
              </motion.div>
            ) : (
              <motion.div
                key="nav"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-shrink-0 overflow-hidden">
                <BottomNav />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </>
  );
}
