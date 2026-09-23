/**
 * src/utils/navigation.ts
 * 
 * Deep-linking and URL helpers for launching Google Maps Turn-by-Turn Navigation
 * on delivery partner mobile devices (Android / iOS / Desktop Web).
 */

export interface NavLocationTarget {
  lat: number;
  lng: number;
  label?: string;
  address?: string;
}

/**
 * Builds the standard Google Maps Universal Navigation URL.
 * When opened on mobile devices (Android or iOS), this automatically opens the native
 * Google Maps App directly in Turn-by-Turn Navigation Mode to the destination coordinate.
 */
export function getGoogleMapsNavigationUrl(
  destination: NavLocationTarget,
  origin?: NavLocationTarget
): string {
  const destQuery = `${destination.lat},${destination.lng}`;
  
  // Standard Google Maps Directions URL:
  // travelmode=driving initiates instant driving route
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destQuery}&travelmode=driving`;
  
  if (origin) {
    url += `&origin=${origin.lat},${origin.lng}`;
  }
  
  return url;
}

/**
 * Direct launch function for triggering Google Maps navigation
 */
export function openGoogleMapsNavigation(
  destination: NavLocationTarget,
  origin?: NavLocationTarget
): void {
  const url = getGoogleMapsNavigationUrl(destination, origin);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Map 1: Rider Location -> Seller Store Location Navigation
 */
export function openRiderToSellerGoogleMaps(
  seller: {
    coordinates?: { lat: number; lng: number };
    lat?: number;
    lng?: number;
    storeName?: string;
    address?: string;
  },
  riderCoord?: { lat: number; lng: number }
): void {
  const lat = seller.coordinates?.lat ?? seller.lat ?? 12.9716;
  const lng = seller.coordinates?.lng ?? seller.lng ?? 77.5946;

  openGoogleMapsNavigation(
    {
      lat,
      lng,
      label: seller.storeName || 'Seller Store',
      address: seller.address,
    },
    riderCoord ? { lat: riderCoord.lat, lng: riderCoord.lng } : undefined
  );
}

/**
 * Map 2: Seller Location -> Customer Location Navigation
 */
export function openSellerToCustomerGoogleMaps(
  customer: {
    coordinates?: { lat: number; lng: number };
    lat?: number;
    lng?: number;
    customerName?: string;
    address?: string;
  },
  sellerCoord?: { lat: number; lng: number }
): void {
  const lat = customer.coordinates?.lat ?? customer.lat ?? 12.9716;
  const lng = customer.coordinates?.lng ?? customer.lng ?? 77.5946;

  openGoogleMapsNavigation(
    {
      lat,
      lng,
      label: customer.customerName || 'Customer Delivery Site',
      address: customer.address,
    },
    sellerCoord ? { lat: sellerCoord.lat, lng: sellerCoord.lng } : undefined
  );
}

