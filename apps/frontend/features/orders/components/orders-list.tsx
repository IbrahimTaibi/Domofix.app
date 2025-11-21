"use client"

import React from "react"
import { Order } from "../services/orders-service"
import OrderCard from "./order-card"

interface OrdersListProps {
  orders: Order[]
  onRefresh?: () => void
}

export default function OrdersList({ orders, onRefresh }: OrdersListProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} onStatusChange={onRefresh} />
      ))}
    </div>
  )
}
