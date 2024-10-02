// types for the nominatim api

type GeoJson = {
  type: "Point";
  coordinates: [number, number];
};

export type Place = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: [string, string, string, string];
  geojson: GeoJson;
};
