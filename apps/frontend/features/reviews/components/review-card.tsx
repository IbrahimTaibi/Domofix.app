"use client"

import React, { useState, useEffect } from "react"
import { Star, MessageCircle, Send, User as UserIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { Review, Comment } from "@domofix/shared-types"
import { addComment, listComments } from "../services/reviews-api"
import { useToast } from "@/shared/hooks/use-toast"

interface ReviewCardProps {
  review: Review
  onReplySuccess?: () => void
}

export default function ReviewCard({ review, onReplySuccess }: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const { success: showSuccess, error: showError } = useToast()

  // Load comments when card mounts
  useEffect(() => {
    loadComments()
  }, [review.id])

  const loadComments = async () => {
    try {
      setLoadingComments(true)
      const response = await listComments(review.id, 1, 20)
      setComments(response.data)
    } catch (error: any) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyContent.trim()) {
      showError("Veuillez entrer une réponse")
      return
    }

    try {
      setIsSubmitting(true)
      await addComment(review.id, { content: replyContent.trim() })
      showSuccess("Réponse envoyée avec succès")
      setReplyContent("")
      setShowReplyForm(false)
      await loadComments() // Reload comments to show the new one
      onReplySuccess?.()
    } catch (error: any) {
      showError(error?.message || "Erreur lors de l'envoi de la réponse")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), "d MMMM yyyy 'à' HH:mm", { locale: fr })
    } catch {
      return "Date inconnue"
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header - Customer info and rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
            <UserIcon className="w-6 h-6" aria-hidden="true" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Client</h3>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>

        {/* Rating stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= review.rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Review comment */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      )}

      {/* Review images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {review.images.map((image, index) => (
            <div
              key={index}
              className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Comments/Replies section */}
      {comments.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-4 h-4 text-primary-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">Vous</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply button / form */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        {!showReplyForm ? (
          <button
            type="button"
            onClick={() => setShowReplyForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Répondre
          </button>
        ) : (
          <form onSubmit={handleSubmitReply} className="space-y-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Écrivez votre réponse..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                {isSubmitting ? "Envoi..." : "Envoyer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false)
                  setReplyContent("")
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
