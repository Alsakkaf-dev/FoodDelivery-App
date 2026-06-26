import { Icon } from '@/components/icons';

// Decorative location picker for Add/Edit Address. There is NO paid map API in
// this app (the checkout address-form uses the same approach), so this is a
// stylized, token-only basemap with a centered pin + a "move to edit" hint and a
// "use my location" affordance. The real pin (pin_lat/pin_lng) is captured via
// navigator.geolocation by the parent form; this stays presentational.
