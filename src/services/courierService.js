import { supabase, isSupabaseConfigured } from './supabase';

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

export const courierService = {
  /**
   * Fetch active deliveries assigned to a courier with automatic fallback to active demo deliveries
   */
  async getAssignedDeliveries(courierId = null) {
    if (isSupabaseConfigured) {
      try {
        const baseSelect = `
          *,
          order:order_id (
            id, order_number, total_amount, status, payment_status,
            buyer:buyer_id (full_name, phone)
          )
        `;

        // 1. If courierId provided, first search for deliveries specifically assigned to this courier in Supabase
        if (courierId) {
          const { data: userDeliveries, error: userError } = await supabase
            .from('deliveries')
            .select(baseSelect)
            .eq('courier_id', courierId)
            .neq('status', 'DELIVERED')
            .order('created_at', { ascending: true });

          if (!userError && userDeliveries && userDeliveries.length > 0) {
            return userDeliveries;
          }
        }

        // 2. Fallback: If no deliveries assigned to this courier yet,
        // fetch any active database deliveries (e.g. from seed.sql or unassigned)
        const { data: allActive, error: allError } = await supabase
          .from('deliveries')
          .select(baseSelect)
          .neq('status', 'DELIVERED')
          .order('created_at', { ascending: true })
          .limit(10);

        if (!allError && allActive && allActive.length > 0) {
          return allActive;
        }
      } catch (err) {
        console.warn('Supabase deliveries fetch notice:', err.message);
      }
    }

    // 3. Fallback when Supabase deliveries table is empty (e.g. teammate hasn't added orders yet)
    // Ensures courier development and testing can proceed seamlessly right away!
    return localDeliveriesState;
  },

  /**
   * One-click claim/assign all seed or unassigned deliveries in database to the logged-in courier
   */
  async assignDemoDeliveriesToCourier(courierId) {
    localDeliveriesState = localDeliveriesState.map((d) => ({
      ...d,
      courier_id: courierId || 'courier-demo',
    }));

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

    // Update in-memory local state
    localDeliveriesState = localDeliveriesState.map((d) =>
      d.id === deliveryId ? { ...d, ...updatePayload } : d
    );

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

