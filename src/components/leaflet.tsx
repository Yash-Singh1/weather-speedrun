import React, { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet-minimap";
import "leaflet/dist/leaflet.css";
import "leaflet-minimap/dist/Control.MiniMap.min.css";

import MapPosition from "../components/MapPosition";

const MapComponent = ({
  display_minimap = false,
  current_result = null,
  position_marker = null,
}) => {
  const [map, setMap] = useState(null);
  const [dataLayers, setDataLayers] = useState([]);
  const mapContainerRef = useRef(null);

  // Function to create and initialize the map
  const createMap = (container) => {
    const attribution = Nominatim_Config.Map_Tile_Attribution;
    const initialMap = L.map(container, {
      attributionControl: false,
      scrollWheelZoom: true,
      touchZoom: false,
      center: [
        Nominatim_Config.Map_Default_Lat,
        Nominatim_Config.Map_Default_Lon,
      ],
      zoom: Nominatim_Config.Map_Default_Zoom,
    });

    if (Nominatim_Config.Map_Default_Bounds) {
      initialMap.fitBounds(Nominatim_Config.Map_Default_Bounds);
    }

    if (attribution) {
      L.control
        .attribution({ prefix: '<a href="https://leafletjs.com/">Leaflet</a>' })
        .addTo(initialMap);
    }

    L.tileLayer(Nominatim_Config.Map_Tile_URL, {
      attribution: attribution,
    }).addTo(initialMap);

    if (display_minimap) {
      const miniMapLayer = new L.TileLayer(Nominatim_Config.Map_Tile_URL, {
        minZoom: 0,
        maxZoom: 13,
        attribution: attribution,
      });
      new L.Control.MiniMap(miniMapLayer, { toggleDisplay: true }).addTo(
        initialMap
      );
    }

    const MapPositionControl = L.Control.extend({
      options: { position: "topright" },
      onAdd: () => document.getElementById("show-map-position"),
    });
    initialMap.addControl(new MapPositionControl());

    return initialMap;
  };

  // Reset map data
  const resetMapData = () => {
    if (!map) return;

    dataLayers.forEach((layer) => {
      map.removeLayer(layer);
    });
    setDataLayers([]);
  };

  // Normalize geojson object
  const parseAndNormalizeGeojsonString = (part) => ({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: part,
        properties: {},
      },
    ],
  });

  // Set the map data
  const setMapData = (aFeature) => {
    if (!map) return;

    resetMapData();

    // Add position marker if available
    if (position_marker) {
      const marker = L.circleMarker(position_marker, {
        radius: 5,
        weight: 2,
        fillColor: "#ff7800",
        color: "red",
        opacity: 0.75,
        zIndexOffset: 100,
        clickable: false,
      });
      marker
        .bindTooltip(`Search (${position_marker[0]},${position_marker[1]})`)
        .openTooltip();
      marker.addTo(map);
      setDataLayers((prev) => [...prev, marker]);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const viewbox = searchParams.get("viewbox");
    if (viewbox) {
      const coords = viewbox.split(",");
      const bounds = L.latLngBounds(
        [coords[1], coords[0]],
        [coords[3], coords[2]]
      );
      const rectangle = L.rectangle(bounds, {
        color: "#69d53e",
        weight: 3,
        dashArray: "5 5",
        opacity: 0.8,
        fill: false,
        interactive: false,
      });
      map.addLayer(rectangle);
      setDataLayers((prev) => [...prev, rectangle]);
    }

    if (!aFeature) return;

    const lat = aFeature.centroid
      ? aFeature.centroid.coordinates[1]
      : aFeature.lat;
    const lon = aFeature.centroid
      ? aFeature.centroid.coordinates[0]
      : aFeature.lon;
    const geojson = aFeature.geometry || aFeature.geojson;

    if (lat && lon) {
      const circle = L.circleMarker([lat, lon], {
        radius: 10,
        weight: 2,
        fillColor: "#ff7800",
        color: "blue",
        opacity: 0.75,
      });
      if (position_marker) {
        circle.bindTooltip("Result").openTooltip();
      }
      map.addLayer(circle);
      setDataLayers((prev) => [...prev, circle]);
    }

    if (geojson) {
      const geojsonLayer = L.geoJson(parseAndNormalizeGeojsonString(geojson), {
        style: { interactive: false, color: "blue" },
      });
      map.addLayer(geojsonLayer);
      setDataLayers((prev) => [...prev, geojsonLayer]);
      map.fitBounds(geojsonLayer.getBounds());
    } else if (lat && lon && position_marker) {
      map.fitBounds([[lat, lon], position_marker], { padding: [50, 50] });
    } else if (lat && lon) {
      map.setView([lat, lon], 10);
    }
  };

  // Effect to create and initialize the map when the component mounts
  useEffect(() => {
    const mapInstance = createMap(mapContainerRef.current);
    setMap(mapInstance);

    return () => {
      setMap(null);
      mapInstance.remove();
    };
  }, []);

  // Effect to update the map data when current_result or position_marker changes
  useEffect(() => {
    setMapData(current_result);
  }, [current_result, position_marker]);

  const handleShowMapPositionClick = (e) => {
    e.target.style.display = "none";
    document.getElementById("map-position").style.display = "block";
  };

  return (
    <div>
      <MapPosition />
      <div
        id="map"
        ref={mapContainerRef}
        style={{ height: "100%", background: "#eee" }}
      />
      <button
        id="show-map-position"
        className="leaflet-bar btn btn-sm btn-outline-secondary"
        onClick={handleShowMapPositionClick}
      >
        show map bounds
      </button>
    </div>
  );
};

export default MapComponent;
