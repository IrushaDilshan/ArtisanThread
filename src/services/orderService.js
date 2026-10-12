import { supabase, isSupabaseConfigured } from './supabase.js';
import { safeStorage } from './storageHelper.js';
import { courierService, setOrderStatusListener } from './courierService.js';

const STORAGE_KEY = '@artisanthread_artisan_orders_v2';
const simulatedPaymentStatuses = new Map();

const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const isSimulatedOrder = (orderId) =>
  typeof orderId === 'string' && (orderId.startsWith('mock_order_') || orderId.startsWith('AT-'));

export const DEFAULT_ARTISAN_ORDERS = [
  {
    id: 'AT-1049',
    item: 'Indigo Silk Scarf (Qty 2)',
    price: 'LKR 25,000',
    rawPrice: 25000,
    total_amount: 25000,
    buyer: 'Maya Lin',
    phone: '+94 77 123 4567',
    destination: '42 Ward Place, Colombo 07',
    date: 'Oct 7, 2026',
    due: 'Today, 3:30 PM',
    status: 'PENDING', // PENDING | SHIPPED | DELIVERED
    payment_status: 'held',
    payment_method: 'Secure Escrow Payment',
    notes: 'Please pack in eco-friendly gift box with custom silk ribbon.',
    photo: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
    assignedCourier: null,
    tracking_code: null,
  },
  {
    id: 'AT-1048',
    item: 'Ceramic Matcha Bowl',
    price: 'LKR 8,500',
    rawPrice: 8500,
    total_amount: 8500,
    buyer: 'Julian Moore',
    phone: '+94 71 987 6543',
    destination: 'Station Road, Kalutara',
    date: 'Oct 6, 2026',
    due: 'Tomorrow, 11:00 AM',
    status: 'PENDING',
    payment_status: 'held',
    payment_method: 'Secure Escrow Payment',
    notes: 'Fragile ceremonial craft piece. Double bubble wrap required.',
    photo: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
    assignedCourier: null,
    tracking_code: null,
  },
  {
    id: 'AT-1045',
    item: 'Sashiko Coaster Set',
    price: 'LKR 4,200',
    rawPrice: 4200,
    total_amount: 4200,
    buyer: 'Sarah Jenkins',
    phone: '+94 76 555 4321',
    destination: 'Beach Road, Beruwala',
    date: 'Sep 27, 2026',
    due: 'Delivered',
    status: 'DELIVERED',
    payment_status: 'held',
    payment_method: 'Secure Escrow Payment',
    notes: 'Direct handoff at workshop studio.',
    photo: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400',
    assignedCourier: 'Marcus Vance',
    tracking_code: 'ATH-1045-BW',
  },
  {
    id: 'AT-1042',
    item: 'Hand-carved Teak Stool',
    price: 'LKR 24,000',
    rawPrice: 24000,
    total_amount: 24000,
    buyer: 'Manji Samaranayaka',
    phone: '+94 77 888 9900',
    destination: 'Peradeniya Road, Kandy',
    date: 'Oct 5, 2026',
    due: 'In Transit',
    status: 'SHIPPED',
    payment_status: 'held',
    payment_method: 'Secure Escrow Payment',
    notes: 'Handed to Courier Partner Marcus Vance.',
    photo: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400',
    assignedCourier: 'Marcus Vance',
    tracking_code: 'ATH-9942-PY',
  },
  {
    id: 'AT-1039',
    item: 'Hand-loomed Cotton Cushion',
    price: 'LKR 6,800',
    rawPrice: 6800,
    total_amount: 6800,
    buyer: 'Nimali Fernando',
    phone: '+94 75 444 3322',
    destination: 'Main Street, Galle',
    date: 'Oct 4, 2026',
    due: 'In Transit',
    status: 'SHIPPED',
    payment_status: 'held',
    payment_method: 'Secure Escrow Payment',
    notes: 'Express courier tracking #ATH-9942-PY.',
    photo: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=400',
    assignedCourier: 'Marcus Vance',
    tracking_code: 'ATH-3312-BW',
  },
  {
    id: 'AT-1034',
    item: 'Botanical Dye Tapestry',
    price: 'LKR 18,500',
    rawPrice: 18500,
    total_amount: 18500,
    buyer: 'Kavinda Perera',
    phone: '+94 72 111 2233',
    destination: 'Negombo Road, Kurunegala',
    date: 'Oct 1, 2026',
    due: 'Delivered',
    status: 'DELIVERED',
    payment_status: 'held',
    payment_method: 'Secure Escrow Payment',
    notes: 'Customer signed digital receipt.',
    photo: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400',
    assignedCourier: 'Marcus Vance',
    tracking_code: 'ATH-1034-CL',
  },
];

let localArtisanOrders = [...DEFAULT_ARTISAN_ORDERS];
let isOrdersLoaded = false;

const loadOrders = async () => {
  if (isOrdersLoaded) return localArtisanOrders;
  try {
    const raw = await safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localArtisanOrders = parsed;
      }
    }
  } catch (e) {
    // Keep in-memory
  }
  isOrdersLoaded = true;
  return localArtisanOrders;
};

const saveOrders = async (orders) => {
  localArtisanOrders = orders;
  try {
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    // Keep in-memory
  }
};

export const orderService = {
  /**
   * Get all orders for the Artisan dashboard & fulfillment
   */
  async getArtisanOrders() {
    await loadOrders();
    return localArtisanOrders;
  },

  /**
   * Place a new order with items - automatically registers with Artisan dashboard
   */
  async createOrder({
    items,
    shippingAddress,
    totalAmount,
    paymentMethod,
    buyerName,
    buyerPhone,
  }) {
    await loadOrders();

    const isCashOnDelivery = /cash|delivery|cod/i.test(
      String(paymentMethod || '')
    );
    const paymentStatus = isCashOnDelivery ? 'cash_on_delivery' : 'pending';
    let authenticatedBuyerId = null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && isUuid(data?.session?.user?.id)) {
          authenticatedBuyerId = data.session.user.id;
        }
      } catch (err) {
        // Fallback to local
      }
    }

    const nextIdNumber = Math.floor(1050 + Math.random() * 8900);
    const orderId = `AT-${nextIdNumber}`;
    const orderNumber = `ATH-${nextIdNumber}-${Date.now().toString().slice(-4)}`;

    const firstItem = items?.[0] || {};
    const itemTitle =
      firstItem.title || firstItem.name || 'Handcrafted Artisan Craft';
    const itemSummary = `${itemTitle}${items?.length > 1 ? ` (+${items.length - 1} more)` : ''} (Qty ${firstItem.quantity || 1})`;
    const rawTotal = Number(totalAmount) || 0;
    const formattedPrice = `LKR ${rawTotal.toLocaleString('en-LK')}`;
    const destinationStr =
      typeof shippingAddress === 'string'
        ? shippingAddress
        : (shippingAddress?.address || shippingAddress?.street || '42 Ward Place, Colombo 07');

    const photo =
      firstItem.image_url ||
      firstItem.image ||
      firstItem.photo ||
      'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?w=400';

    const notes = isCashOnDelivery
      ? 'Cash on Delivery. Please collect cash from customer upon delivery.'
      : 'Secure Escrow Payment Held. Ready for packaging and courier dispatch.';

    let dbId = null;

    if (authenticatedBuyerId) {
      try {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              order_number: orderNumber,
              buyer_id: authenticatedBuyerId,
              status: 'PENDING',
              total_amount: rawTotal,
              shipping_address: typeof shippingAddress === 'object' ? shippingAddress : { address: shippingAddress },
              payment_status: paymentStatus,
            },
          ])
          .select()
          .single();

        if (!orderError && order) {
          dbId = order.id;

          if (Array.isArray(items) && items.length > 0) {
            const orderItems = items.map((item) => ({
              order_id: order.id,
              product_id: item.productId || item.id,
              quantity: item.quantity || 1,
              unit_price: item.price || 0,
            }));

            await supabase.from('order_items').insert(orderItems);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase createOrder notice:', dbErr.message);
      }
    }

    // Comprehensive order record shared across Buyer, Artisan, and Courier
    const sharedOrder = {
      id: orderId,
      db_id: dbId,
      order_number: orderNumber,
      item: itemSummary,
      price: formattedPrice,
      rawPrice: rawTotal,
      total_amount: rawTotal,
      buyer: buyerName || 'Sandunika Perera',
      phone: buyerPhone || '+94 77 123 4567',
      destination: destinationStr,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      due: 'Pending Courier Pickup',
      status: 'PENDING',
      payment_status: paymentStatus,
      payment_method: isCashOnDelivery ? 'Cash on Delivery' : 'Secure Escrow Payment',
      notes,
      photo,
      items: items || [],
      assignedCourier: null,
      tracking_code: null,
      created_at: new Date().toISOString(),
    };

    // Prepend to Artisan orders list so it appears immediately at the top
    const updatedOrders = [sharedOrder, ...localArtisanOrders.filter((o) => o.id !== orderId)];
    await saveOrders(updatedOrders);

    simulatedPaymentStatuses.set(orderId, paymentStatus);
    if (dbId) {
      simulatedPaymentStatuses.set(dbId, paymentStatus);
    }

    return sharedOrder;
  },

  /**
   * Fetch orders for a buyer
   */
  async getBuyerOrders(buyerId) {
    await loadOrders();

    if (isSupabaseConfigured && isUuid(buyerId)) {
      try {
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

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getBuyerOrders notice:', err.message);
      }
    }

    return localArtisanOrders;
  },

  /**
   * Update order status (e.g. from PENDING to SHIPPED / DELIVERED)
   */
  async updateOrderStatus(orderId, status) {
    await loadOrders();

    const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : 'PENDING';
    const updated = localArtisanOrders.map((o) => {
      if (
        o.id === orderId ||
        o.order_number === orderId ||
        o.db_id === orderId ||
        (o.tracking_code && o.tracking_code === orderId)
      ) {
        return {
          ...o,
          status: normalizedStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return o;
    });

    await saveOrders(updated);

    if (isSupabaseConfigured && isUuid(orderId)) {
      try {
        const { data } = await supabase
          .from('orders')
          .update({ status: normalizedStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId)
          .select()
          .single();
        if (data) return data;
      } catch (err) {
        console.warn('Supabase updateOrderStatus notice:', err.message);
      }
    }

    const found = updated.find(
      (o) =>
        o.id === orderId ||
        o.order_number === orderId ||
        o.db_id === orderId ||
        (o.tracking_code && o.tracking_code === orderId)
    );
    return found || { id: orderId, status: normalizedStatus };
  },

  /**
   * Store simulated escrow/refund state without payment credentials.
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    await loadOrders();

    if (orderId) {
      simulatedPaymentStatuses.set(String(orderId), paymentStatus);
    }

    const updated = localArtisanOrders.map((o) => {
      if (
        o.id === orderId ||
        o.order_number === orderId ||
        o.db_id === orderId ||
        (o.tracking_code && o.tracking_code === orderId)
      ) {
        return {
          ...o,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return o;
    });

    await saveOrders(updated);

    if (isSupabaseConfigured && isUuid(orderId)) {
      try {
        const { data } = await supabase
          .from('orders')
          .update({
            payment_status: paymentStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .select()
          .single();
        if (data) return data;
      } catch (err) {
        console.warn('Supabase updatePaymentStatus notice:', err.message);
      }
    }

    const found = updated.find(
      (o) =>
        o.id === orderId ||
        o.order_number === orderId ||
        o.db_id === orderId ||
        (o.tracking_code && o.tracking_code === orderId)
    );
    return found || { id: orderId, payment_status: paymentStatus };
  },

  /**
   * Assign an artisan order to a courier partner (Main Flow step)
   */
  async assignCourierToOrder(orderId, courierInfo = {}) {
    await loadOrders();

    const orderIndex = localArtisanOrders.findIndex(
      (o) => o.id === orderId || o.order_number === orderId || o.db_id === orderId
    );

    if (orderIndex === -1) {
      throw new Error(`Order #${orderId} was not found in active orders.`);
    }

    const order = localArtisanOrders[orderIndex];
    const courierName = courierInfo.name || 'Marcus Vance';
    const courierId = courierInfo.id || 'usr_courier_01';
    const trackingCode =
      order.tracking_code ||
      `ATH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-2)}`;

    const updatedOrder = {
      ...order,
      status: 'SHIPPED',
      assignedCourier: courierName,
      courierId,
      tracking_code: trackingCode,
      due: 'In Transit',
      notes: `${order.notes || ''}\nHanded to Courier Partner ${courierName}. Tracking #${trackingCode}`.trim(),
      updated_at: new Date().toISOString(),
    };

    localArtisanOrders[orderIndex] = updatedOrder;
    await saveOrders([...localArtisanOrders]);

    // Create the delivery in courierService so it appears immediately in the courier's Daily Jobs!
    const delivery = await courierService.createDeliveryFromOrder(updatedOrder, {
      id: courierId,
      name: courierName,
    });

    // If Supabase is connected, update order status
    if (isSupabaseConfigured && order.db_id) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'SHIPPED', updated_at: new Date().toISOString() })
          .eq('id', order.db_id);
      } catch (e) {
        console.warn('Supabase assign courier order notice:', e.message);
      }
    }

    return { updatedOrder, delivery };
  },

  async getPaymentStatus(orderId) {
    if (!orderId) return null;

    if (!isSupabaseConfigured || isSimulatedOrder(orderId)) {
      return simulatedPaymentStatuses.get(String(orderId)) || null;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('id', orderId)
        .maybeSingle();

      if (!error && data?.payment_status) return data.payment_status;
    } catch (err) {
      // fallback
    }

    return simulatedPaymentStatuses.get(String(orderId)) || null;
  },

  async completeSimulatedRefund(orderId) {
    if (!orderId) return 'REFUNDED';
    simulatedPaymentStatuses.set(String(orderId), 'REFUNDED');
    await this.updatePaymentStatus(orderId, 'refunded');
    return 'REFUNDED';
  },

  /**
   * Cancel only orders that are still in a buyer-cancellable stage.
   */
  async cancelOrder(orderId, paymentStatus) {
    await loadOrders();

    if (orderId && paymentStatus) {
      simulatedPaymentStatuses.set(String(orderId), paymentStatus);
    }

    const updated = localArtisanOrders.map((o) => {
      if (o.id === orderId || o.order_number === orderId || o.db_id === orderId) {
        return {
          ...o,
          status: 'CANCELLED',
          ...(paymentStatus ? { payment_status: paymentStatus } : {}),
          updated_at: new Date().toISOString(),
        };
      }
      return o;
    });

    await saveOrders(updated);

    if (isSupabaseConfigured && isUuid(orderId)) {
      try {
        await supabase
          .from('orders')
          .update({
            status: 'CANCELLED',
            ...(paymentStatus ? { payment_status: paymentStatus } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase cancelOrder notice:', err.message);
      }
    }

    return {
      id: orderId,
      status: 'CANCELLED',
      ...(paymentStatus ? { payment_status: paymentStatus } : {}),
    };
  },

  /**
   * Get an order by any identifier (id, order_number, tracking_code, db_id)
   */
  async getOrderById(orderId) {
    await loadOrders();
    const normalized = String(orderId || '').trim();
    if (!normalized) return null;

    const found = localArtisanOrders.find(
      (o) =>
        String(o.id) === normalized ||
        String(o.order_number) === normalized ||
        String(o.db_id) === normalized ||
        (o.tracking_code && String(o.tracking_code) === normalized)
    );

    if (!found && isSupabaseConfigured && isUuid(orderId)) {
      try {
        const { data } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items (
              id, product_id, quantity, unit_price,
              product:product_id (title, image_url, category)
            ),
            delivery:deliveries (tracking_code, status, estimated_arrival)
          `)
          .eq('id', orderId)
          .maybeSingle();

        if (data) return data;
      } catch (e) {
        // ignore
      }
    }

    return found || null;
  },
};

// Wire listener from courier status changes to automatically update order status
setOrderStatusListener(async (orderId, newStatus) => {
  try {
    await orderService.updateOrderStatus(orderId, newStatus);
    if (newStatus === 'DELIVERED') {
      await orderService.updatePaymentStatus(orderId, 'released');
    }
  } catch (err) {
    console.warn('Auto order sync notice:', err.message);
  }
});
