import { supabase, isSupabaseConfigured } from './supabase';

const simulatedPaymentStatuses = new Map();
const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
const isSimulatedOrder = (orderId) =>
  typeof orderId === 'string' && orderId.startsWith('mock_order_');

export const orderService = {
  /**
   * Place a new order with items
   */
  async createOrder({
    items,
    shippingAddress,
    totalAmount,
    paymentMethod,
  }) {
    const isCashOnDelivery = /cash|delivery|cod/i.test(
      String(paymentMethod || '')
    );
    const paymentStatus = isCashOnDelivery ? 'cash_on_delivery' : 'pending';
    let authenticatedBuyerId = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      if (isUuid(data?.session?.user?.id)) {
        authenticatedBuyerId = data.session.user.id;
      }
    }

    if (!authenticatedBuyerId) {
      const id = `mock_order_${Date.now()}`;
      simulatedPaymentStatuses.set(id, paymentStatus);
      return {
        id,
        status: 'PENDING',
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        payment_method: isCashOnDelivery
          ? 'cash_on_delivery'
          : 'secure_escrow',
        payment_status: paymentStatus,
        items,
      };
    }

    const orderNumber = `ATH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    // 1. Create main order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          buyer_id: authenticatedBuyerId,
          status: 'PENDING',
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          payment_status: paymentStatus,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId || item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return {
      ...order,
      payment_method: isCashOnDelivery
        ? 'cash_on_delivery'
        : 'secure_escrow',
    };
  },

  /**
   * Fetch orders for a buyer
   */
  async getBuyerOrders(buyerId) {
    if (!isSupabaseConfigured || !isUuid(buyerId)) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          id, product_id, quantity, unit_price,
          product:product_id (title, image_url, category)
        ),
        delivery:deliveries (tracking_code, status, estimated_arrival)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update order status (e.g. from CRAFTING to READY_FOR_PICKUP)
   */
  async updateOrderStatus(orderId, status) {
    if (!isSupabaseConfigured || isSimulatedOrder(orderId)) {
      return { id: orderId, status };
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Store simulated escrow/refund state without payment credentials.
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    if (!isSupabaseConfigured || isSimulatedOrder(orderId)) {
      if (orderId) {
        simulatedPaymentStatuses.set(String(orderId), paymentStatus);
      }
      return { id: orderId, payment_status: paymentStatus };
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPaymentStatus(orderId) {
    if (!orderId) return null;

    if (!isSupabaseConfigured || isSimulatedOrder(orderId)) {
      return simulatedPaymentStatuses.get(String(orderId)) || null;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    return data?.payment_status || null;
  },

  async completeSimulatedRefund(orderId) {
    if (!orderId) return 'REFUNDED';

    if (!isSupabaseConfigured || isSimulatedOrder(orderId)) {
      const currentStatus = String(
        simulatedPaymentStatuses.get(String(orderId)) || ''
      ).toUpperCase();
      if (currentStatus === 'REFUND_INITIATED') {
        simulatedPaymentStatuses.set(String(orderId), 'REFUNDED');
        return 'REFUNDED';
      }
      return currentStatus || null;
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('payment_status', 'refund_initiated')
      .select('payment_status')
      .maybeSingle();

    if (error) throw error;
    if (data?.payment_status) {
      return String(data.payment_status).toUpperCase();
    }

    return (await this.getPaymentStatus(orderId))?.toUpperCase() || null;
  },

  /**
   * Cancel only orders that are still in a buyer-cancellable stage.
   */
  async cancelOrder(orderId, paymentStatus) {
    if (!isSupabaseConfigured || isSimulatedOrder(orderId)) {
      if (orderId && paymentStatus) {
        simulatedPaymentStatuses.set(String(orderId), paymentStatus);
      }
      return {
        id: orderId,
        status: 'CANCELLED',
        ...(paymentStatus ? { payment_status: paymentStatus } : {}),
      };
    }

    const update = {
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
    };
    if (paymentStatus) {
      update.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', orderId)
      .in('status', ['PENDING', 'CONFIRMED', 'CRAFTING'])
      .select()
      .single();

    if (error?.code === 'PGRST116') {
      const cancellationError = new Error(
        'This order can no longer be cancelled.'
      );
      cancellationError.code = 'ORDER_NOT_CANCELLABLE';
      throw cancellationError;
    }
    if (error) throw error;
    return data;
  },
};
