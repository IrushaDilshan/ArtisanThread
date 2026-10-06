import { supabase, isSupabaseConfigured } from './supabase';

export const orderService = {
  /**
   * Place a new order with items
   */
  async createOrder({ buyerId, items, shippingAddress, totalAmount }) {
    if (!isSupabaseConfigured) {
      return { id: `mock_order_${Date.now()}`, status: 'PENDING' };
    }

    const orderNumber = `ATH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    // 1. Create main order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          buyer_id: buyerId,
          status: 'PENDING',
          total_amount: totalAmount,
          shipping_address: shippingAddress,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  /**
   * Fetch orders for a buyer
   */
  async getBuyerOrders(buyerId) {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          id, quantity, unit_price,
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
    if (!isSupabaseConfigured) return { id: orderId, status };

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
