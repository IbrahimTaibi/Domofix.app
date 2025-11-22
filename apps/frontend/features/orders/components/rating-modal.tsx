"use client"

import React, { useState } from "react"
import { X, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => Promise<void>
  providerName: string
}

export default function RatingModal({ isOpen, onClose, onSubmit, providerName }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Veuillez sélectionner une note")
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(rating, comment)
      // Reset form
      setRating(0)
      setComment("")
      onClose()
    } catch (error: any) {
      console.error("Failed to submit rating:", error)
      alert(error?.message || "Erreur lors de l'envoi de l'évaluation")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0)
      setComment("")
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-8 text-center">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <Star className="w-10 h-10 text-white fill-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Évaluer le service
                </h2>
                <p className="text-white/90 text-sm">
                  Comment s'est passé votre expérience avec <strong>{providerName}</strong> ?
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Star Rating */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900 text-center">
                    Votre note
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= (hoveredRating || rating)
                      return (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
                        >
                          <Star
                            className={`w-10 h-10 transition-all duration-200 ${
                              isActive
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </motion.button>
                      )
                    })}
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm font-medium text-gray-600"
                    >
                      {rating === 1 && "Très insatisfait"}
                      {rating === 2 && "Insatisfait"}
                      {rating === 3 && "Moyen"}
                      {rating === 4 && "Satisfait"}
                      {rating === 5 && "Très satisfait"}
                    </motion.p>
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label htmlFor="comment" className="block text-sm font-semibold text-gray-900">
                    Votre avis <span className="text-gray-500 font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Partagez votre expérience..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {comment.length}/500 caractères
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Plus tard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || rating === 0}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Envoyer l'évaluation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
