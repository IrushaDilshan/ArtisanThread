// Simulated coordinates for the university prototype.
// These are not real-time GPS coordinates.
export const TRACKING_DEMO_LOCATIONS = {
  artisanPickup: {
    latitude: 6.9271,
    longitude: 79.8612,
  },
  courierAtPickup: {
    latitude: 6.925,
    longitude: 79.866,
  },
  courierInTransit: {
    latitude: 6.918,
    longitude: 79.9,
  },
  buyerDestination: {
    latitude: 6.9147,
    longitude: 79.973,
  },
};

export const getDemoCourierCoordinate = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'READY_FOR_PICKUP':
    case 'COURIER_ASSIGNED':
      return TRACKING_DEMO_LOCATIONS.courierAtPickup;
    case 'IN_TRANSIT':
      return TRACKING_DEMO_LOCATIONS.courierInTransit;
    case 'DELIVERED':
      return TRACKING_DEMO_LOCATIONS.buyerDestination;
    default:
      return null;
  }
};
