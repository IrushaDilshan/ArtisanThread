import { supabase, isSupabaseConfigured } from './supabase.js';
import { safeStorage } from './storageHelper.js';

const STORAGE_KEY = '@artisanthread_courier_deliveries_v2';

export const DEFAULT_DEMO_DELIVERIES = [
  {
    id: 'demo-del-1',
    order_id: 'demo-ord-1',
    courier_id: null,
    tracking_code: 'ATH-9942-PY',
    status: 'ASSIGNED',
    pickup_address: {
      name: 'Kumara Batiks & Silk Workshop',
      address_line1: '142 Temple Road',
      city: 'Kandy',
      phone: '+94 81 223 4567',
      details: '2 parcels (1.4 kg) · Handloom Batik Shawls',
    },
    dropoff_address: {
      name: 'Nimal Jayasuriya',
      address_line1: '28/4 Galle Road',
      city: 'Colombo 03',
      phone: '+94 77 123 4567',
      details: '2 parcels (1.4 kg) · Express Delivery',
    },
    pickup_lat: 7.2906,
    pickup_lng: 80.6337,
    dropoff_lat: 6.9271,
    dropoff_lng: 79.8612,
    recipient_notes: 'Fragile: Handcrafted Silk. COD: LKR 12,500',
    order: {
      id: 'demo-ord-1',
      order_number: 'ORD-2026-001',
      total_amount: 12500,
      status: 'PROCESSING',
      payment_status: 'cash_on_delivery',
      buyer: {
        full_name: 'Nimal Jayasuriya',
        phone: '+94 77 123 4567',
      },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-del-2',
    order_id: 'demo-ord-2',
    courier_id: null,
    tracking_code: 'ATH-2291-KL',
    status: 'ARRIVED_AT_ARTISAN',
    pickup_address: {
      name: 'Ruhunu Pottery Works',
      address_line1: '55 Pottery Lane',
      city: 'Kelaniya',
      phone: '+94 11 291 8822',
      details: '1 crate (3.2 kg) · Terracotta Vases',
    },
    dropoff_address: {
      name: 'Dilani Perera',
      address_line1: '14 Dharmapala Mawatha',
      city: 'Colombo 07',
      phone: '+94 71 987 6543',
      details: '1 crate (3.2 kg)',
    },
    pickup_lat: 6.9537,
    pickup_lng: 79.9168,
    dropoff_lat: 6.9147,
    dropoff_lng: 79.8643,
    recipient_notes: 'Handle with care - Fragile Ceramics',
    order: {
      id: 'demo-ord-2',
      order_number: 'ORD-2026-002',
      total_amount: 8400,
      status: 'PROCESSING',
      payment_status: 'paid',
      buyer: {
        full_name: 'Dilani Perera',
        phone: '+94 71 987 6543',
      },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-del-3',
    order_id: 'demo-ord-3',
    courier_id: null,
    tracking_code: 'ATH-3312-BW',
    status: 'IN_TRANSIT',
    pickup_address: {
      name: 'Moratuwa Woodcraft Studio',
      address_line1: '78 Galle Face Terrace',
      city: 'Moratuwa',
      phone: '+94 11 264 5533',
      details: '1 parcel (2.1 kg) · Carved Wall Art',
    },
    dropoff_address: {
      name: 'Kasun Wickramasinghe',
      address_line1: '45 Nawala Road',
      city: 'Rajagiriya',
      phone: '+94 76 555 4321',
      details: '1 parcel (2.1 kg)',
    },
    pickup_lat: 6.7730,
    pickup_lng: 79.8816,
    dropoff_lat: 6.9080,
    dropoff_lng: 79.8940,
    recipient_notes: 'Call before delivery. COD: LKR 15,200',
    order: {
      id: 'demo-ord-3',
      order_number: 'ORD-2026-003',
      total_amount: 15200,
      status: 'SHIPPED',
      payment_status: 'cash_on_delivery',
      buyer: {
        full_name: 'Kasun Wickramasinghe',
        phone: '+94 76 555 4321',
      },
    },
    created_at: new Date().toISOString(),
  },
];

let localDeliveriesState = [...DEFAULT_DEMO_DELIVERIES];
let isLoaded = false;
let _orderStatusListener = null;

export const setOrderStatusListener = (listener) => {
  _orderStatusListener = listener;
};

const loadDeliveries = async () => {
  if (isLoaded) return localDeliveriesState;
  try {
    const raw = await safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localDeliveriesState = parsed;
      }
    }
  } catch (e) {
    // Keep in-memory
  }
  isLoaded = true;
  return localDeliveriesState;
};

const saveDeliveries = async (deliveries) => {
  localDeliveriesState = deliveries;
  try {
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
  } catch (e) {
    // Keep in-memory
  }
};

export const isDeliveryForCourier = (d, courierId, user = null) => {
  if (!d) return false;

  const currentId = courierId || user?.id;
  const currentName = user?.name ? user.name.trim().toLowerCase() : null;
  const currentPhone = user?.phone ? user.phone.replace(/[^0-9]/g, '') : null;

  const dCourierId = d.courier_id || d.courierId;
  const dCourierName = (d.courier_name || d.order?.assignedCourier || '').trim().toLowerCase();
  const dCourierPhone = (d.courier_phone || '').replace(/[^0-9]/g, '');

  // 1. Direct match on Courier ID (UUID or custom ID)
  if (currentId && dCourierId && dCourierId === currentId) {
    return true;
  }

  // 2. Direct match on Phone number
  if (
    currentPhone &&
    dCourierPhone &&
    currentPhone.length >= 7 &&
    (currentPhone.endsWith(dCourierPhone) || dCourierPhone.endsWith(currentPhone))
  ) {
    return true;
  }

  // 3. Direct match on Courier Name
  if (
    currentName &&
    dCourierName &&
    (currentName === dCourierName ||
      currentName.includes(dCourierName) ||
      dCourierName.includes(currentName))
  ) {
    return true;
  }

  // 4. If assigned specifically to a DIFFERENT courier, DO NOT show to current courier
  const isAssignedToOther =
    (dCourierId &&
      currentId &&
      dCourierId !== currentId &&
      dCourierId !== 'usr_courier_01' &&
      dCourierId !== 'courier-demo') ||
    (dCourierName &&
      currentName &&
      dCourierName !== currentName &&
      dCourierName !== 'marcus vance' &&
      dCourierName !== 'unassigned');

  if (isAssignedToOther) {
    return false;
  }

  // 5. Default/Demo unassigned deliveries without a specific owner are viewable
  if (!dCourierId || dCourierId === 'courier-demo' || dCourierId === 'usr_courier_01') {
    return true;
  }

  return false;
};

export const courierService = {
  /**
   * Fetch active deliveries assigned strictly to a specific courier with fallback
   */
  async getAssignedDeliveries(courierId = null, user = null) {
    await loadDeliveries();

    const results = [];

    if (isSupabaseConfigured) {
      try {
        const baseSelect = `
          *,
          order:order_id (
            id, order_number, total_amount, status, payment_status,
            buyer:buyer_id (full_name, phone)
          )
        `;

        if (courierId) {
          const { data: userDeliveries, error: userError } = await supabase
            .from('deliveries')
            .select(baseSelect)
            .eq('courier_id', courierId)
            .order('created_at', { ascending: false });

          if (!userError && userDeliveries && userDeliveries.length > 0) {
            for (const d of userDeliveries) {
              results.push(d);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase deliveries fetch notice:', err.message);
      }
    }

    // Filter local deliveries specifically for this courier
    for (const local of localDeliveriesState) {
      if (isDeliveryForCourier(local, courierId, user)) {
        if (
          !results.some(
            (d) =>
              d.id === local.id ||
              (d.tracking_code && d.tracking_code === local.tracking_code)
          )
        ) {
          results.push(local);
        }
      }
    }

    return results;
  },

  /**
   * Create a new delivery job for courier when artisan assigns an order
   */
  async createDeliveryFromOrder(order, courierInfo = {}) {
    await loadDeliveries();

    const trackingCode =
      order.tracking_code ||
      `ATH-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-2)}`;

    const totalAmount = order.rawPrice || order.total_amount || 0;
    const isCod =
      order.payment_status === 'cash_on_delivery' ||
      order.payment_method === 'Cash on Delivery';

    const newDelivery = {
      id: `del-${order.id || Date.now()}`,
      order_id: order.db_id || order.id,
      courier_id: courierInfo.id || 'usr_courier_01',
      courier_name: courierInfo.name || courierInfo.full_name || 'Marcus Vance',
      courier_phone: courierInfo.phone || '',
      tracking_code: trackingCode,
      status: 'ASSIGNED',
      total_amount: totalAmount,
      pickup_address: {
        name: order.artisanName || 'Takahashi Handloom & Indigo Studio',
        address_line1: '142 Temple Road',
        city: 'Kandy',
        phone: '+94 81 223 4567',
        details: `${order.item || '1 craft parcel'} · Packaging Ready`,
      },
      dropoff_address: {
        name: order.buyer || 'Customer Delivery',
        address_line1: order.destination || '42 Ward Place, Colombo 07',
        city: order.destination?.split(',')?.pop()?.trim() || 'Colombo 07',
        phone: order.phone || '+94 77 123 4567',
        details: `Order #${order.id} · ${order.item || ''}`,
      },
      pickup_lat: 7.2906,
      pickup_lng: 80.6337,
      dropoff_lat: 6.9271,
      dropoff_lng: 79.8612,
      recipient_notes:
        order.notes ||
        (isCod
          ? `COD: LKR ${Number(totalAmount).toLocaleString('en-LK')}`
          : 'Escrow Held. Fragile handcrafted piece - Handle with care'),
      order: {
        id: order.id,
        order_number: order.order_number || order.id,
        total_amount: totalAmount,
        status: 'PROCESSING',
        payment_status: isCod ? 'cash_on_delivery' : 'held',
        buyer: {
          full_name: order.buyer,
          phone: order.phone,
        },
      },
      created_at: new Date().toISOString(),
    };

    // Prepend to active deliveries list
    const updated = [newDelivery, ...localDeliveriesState.filter(d => d.id !== newDelivery.id && d.tracking_code !== trackingCode)];
    await saveDeliveries(updated);

    // If Supabase is connected, attempt insert
    if (isSupabaseConfigured) {
      try {
        await supabase.from('deliveries').insert([
          {
            tracking_code: trackingCode,
            order_id: order.db_id || null,
            courier_id: courierInfo.id && courierInfo.id.length === 36 ? courierInfo.id : null,
            status: 'ASSIGNED',
            pickup_address: newDelivery.pickup_address,
            dropoff_address: newDelivery.dropoff_address,
            recipient_notes: newDelivery.recipient_notes,
          },
        ]);
      } catch (e) {
        console.warn('Supabase delivery insert notice:', e.message);
      }
    }

    return newDelivery;
  },

  /**
   * One-click claim/assign all seed or unassigned deliveries in database to the logged-in courier
   */
  async assignDemoDeliveriesToCourier(courierId) {
    await loadDeliveries();
    localDeliveriesState = localDeliveriesState.map((d) => ({
      ...d,
      courier_id: courierId || 'courier-demo',
    }));
    await saveDeliveries(localDeliveriesState);

    if (isSupabaseConfigured && courierId) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .update({ courier_id: courierId })
          .neq('status', 'DELIVERED')
          .select();

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase assign notice:', e.message);
      }
    }

    return localDeliveriesState;
  },

  /**
   * Verify parcel tracking code on scan
   */
  async verifyTrackingCode(trackingCode) {
    await loadDeliveries();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select(`
            *,
            order:order_id (
              id, order_number, total_amount,
              buyer:buyer_id (full_name, phone)
            )
          `)
          .eq('tracking_code', trackingCode)
          .single();

        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase verifyTrackingCode notice:', e.message);
      }
    }

    // Fallback: search in local state (case-insensitive)
    const normalized = (trackingCode || '').trim().toUpperCase();
    const found = localDeliveriesState.find(
      (d) => d.tracking_code?.toUpperCase() === normalized
    );

    if (found) return found;

    return {
      id: 'demo-generic',
      tracking_code: trackingCode,
      status: 'ASSIGNED',
      pickup_address: { name: 'Artisan Workshop', city: 'Kandy' },
      dropoff_address: { name: 'Customer Destination', city: 'Colombo' },
    };
  },

  /**
   * Update courier's live GPS coordinates for in-transit tracking
   */
  async updateCourierLocation(deliveryId, latitude, longitude) {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('deliveries')
          .update({
            current_lat: latitude,
            current_lng: longitude,
            updated_at: new Date().toISOString(),
          })
          .eq('id', deliveryId);
      } catch (error) {
        console.warn('GPS location notice:', error.message);
      }
    }
  },

  /**
   * Mark delivery as picked up or completed
   */
  async updateDeliveryStatus(deliveryId, status, extraFields = {}) {
    await loadDeliveries();

    const updatePayload = {
      status,
      updated_at: new Date().toISOString(),
      ...extraFields,
    };

    if (status === 'PICKED_UP') {
      updatePayload.picked_up_at = new Date().toISOString();
    } else if (status === 'DELIVERED') {
      updatePayload.delivered_at = new Date().toISOString();
    }

    const targetDelivery = localDeliveriesState.find(
      (d) =>
        d.id === deliveryId ||
        d.tracking_code === deliveryId ||
        (d.tracking_code && String(d.tracking_code).toUpperCase() === String(deliveryId).toUpperCase()) ||
        d.order_id === deliveryId ||
        d.order?.id === deliveryId
    );

    const updated = localDeliveriesState.map((d) => {
      const isMatch =
        d.id === deliveryId ||
        d.tracking_code === deliveryId ||
        (d.tracking_code && String(d.tracking_code).toUpperCase() === String(deliveryId).toUpperCase()) ||
        d.order_id === deliveryId ||
        d.order?.id === deliveryId;

      if (!isMatch) return d;

      const totalAmt =
        extraFields.total_amount ||
        d.total_amount ||
        d.order?.total_amount ||
        d.order?.rawPrice;

      return {
        ...d,
        ...updatePayload,
        total_amount: totalAmt,
        order: d.order
          ? {
              ...d.order,
              status: status === 'DELIVERED' ? 'DELIVERED' : d.order.status,
              total_amount: totalAmt,
            }
          : d.order,
      };
    });
    await saveDeliveries(updated);

    if (_orderStatusListener) {
      const orderId =
        targetDelivery?.order_id ||
        targetDelivery?.order?.id ||
        targetDelivery?.tracking_code ||
        deliveryId;
      if (orderId) {
        if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
          _orderStatusListener(orderId, 'IN_TRANSIT');
        } else if (status === 'DELIVERED') {
          _orderStatusListener(orderId, 'DELIVERED');
        } else if (status === 'RESCHEDULED') {
          _orderStatusListener(orderId, 'RESCHEDULED');
        } else if (status === 'RETURNED') {
          _orderStatusListener(orderId, 'RETURNED');
        }
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .update(updatePayload)
          .eq('id', deliveryId)
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase status update notice:', err.message);
      }
    }

    return { id: deliveryId, ...updatePayload };
  },
};
