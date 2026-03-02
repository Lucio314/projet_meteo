export interface GeocodingResponse {
  name: string;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    state?: string;
  };
}