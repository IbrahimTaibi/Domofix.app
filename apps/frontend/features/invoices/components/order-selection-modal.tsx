'use client';

import React, { useEffect, useState } from 'react';
import { X, FileText, Clock, CheckCircle } from 'lucide-react';
import { Order, listMyOrders } from '@/features/orders/services/orders-service';
import { format } from 'date-fns';

interface OrderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export function OrderSelectionModal({ isOpen, onClose, onSelectOrder }: OrderSelectionModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Only fetch completed orders (these can be invoiced)
      const data = await listMyOrders({ status: 'completed' });
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getCustomerName = (order: Order) => {
    if (typeof order.customerId === 'object') {
      return `${order.customerId.firstName} ${order.customerId.lastName}`;
    }
    return 'Unknown Customer';
  };

  const getServiceTitle = (order: Order) => {
    if (typeof order.requestId === 'object') {
      return order.requestId.category?.charAt(0).toUpperCase() + order.requestId.category?.slice(1);
    }
    return 'Service';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Order</h2>
            <p className="text-sm text-gray-600 mt-1">Choose a completed order to create an invoice</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No completed orders found</p>
              <p className="text-gray-500 text-sm mt-2">Complete an order first before creating an invoice</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <button
                  key={order._id}
                  onClick={() => onSelectOrder(order)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getServiceTitle(order)}
                          </h3>
                          <p className="text-sm text-gray-600">{getCustomerName(order)}</p>
                        </div>
                      </div>

                      <div className="ml-11 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Completed: {format(new Date(order.completedAt!), 'MMM dd, yyyy')}</span>
                        </div>
                        {typeof order.requestId === 'object' && order.requestId.details && (
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {order.requestId.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600">
            💡 Tip: Only completed orders can be invoiced. The invoice will auto-fill customer information from the order.
          </p>
        </div>
      </div>
    </div>
  );
}
