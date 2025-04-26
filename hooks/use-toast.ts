// Simplified version of the toast hook
"use client"

import type React from "react"

import { useState } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

type ToastOptions = Omit<ToastProps, "id">

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ ...props }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, ...props }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 5000)

    return id
  }

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}
