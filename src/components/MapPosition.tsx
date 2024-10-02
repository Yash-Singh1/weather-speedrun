import React, { useState, useEffect } from 'react';
import L from 'leaflet';

// Define types for our props and state
type MapStore = {
  subscribe: (callback: (map: L.Map | null) => void) => { unsubscribe: () => void };
};

interface MapPositionProps {
  mapStore: MapStore;
}

const MapPosition: React.FC<MapPositionProps> = ({ mapStore }) => {
  const [lastClickLatLng, setLastClickLatLng] = useState<L.LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<string>('');
  const [mapZoom, setMapZoom] = useState<number>(0);
  const [mapViewbox, setMapViewbox] = useState<string>('');
  const [viewOnOsmLink, setViewOnOsmLink] = useState<string>('');
  const [lastClick, setLastClick] = useState<string>('');
  const [mousePosition, setMousePosition] = useState<string>('-');
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const mapLinkToOsm = (map: L.Map): string => {
    const zoom = map.getZoom();
    const lat = map.getCenter().lat.toFixed(5);
    const lng = map.getCenter().lng.toFixed(5);
    return `https://openstreetmap.org/#map=${zoom}/${lat}/${lng}`;
  };

  const mapViewboxAsString = (map: L.Map): string => {
    const bounds = map.getBounds();
    let west = bounds.getWest();
    let east = bounds.getEast();
    if (east - west >= 360) {
      west = map.getCenter().lng - 179.999;
      east = map.getCenter().lng + 179.999;
    }
    east = L.latLng(77, east).wrap().lng;
    west = L.latLng(77, west).wrap().lng;
    return [
      west.toFixed(5),
      bounds.getNorth().toFixed(5),
      east.toFixed(5),
      bounds.getSouth().toFixed(5)
    ].join(',');
  };

  const displayMapPosition = (map: L.Map, mouseLatLng?: L.LatLng): void => {
    const center = map.getCenter();
    setMapCenter(`${center.lat.toFixed(5)},${center.lng.toFixed(5)}`);
    setViewOnOsmLink(mapLinkToOsm(map));
    setMapZoom(map.getZoom());
    setMapViewbox(mapViewboxAsString(map));
    
    if (mouseLatLng) {
      setMousePosition(`${mouseLatLng.lat.toFixed(5)},${mouseLatLng.lng.toFixed(5)}`);
    } else {
      setMousePosition('-');
    }
    
    if (lastClickLatLng) {
      setLastClick(`${lastClickLatLng.lat.toFixed(5)},${lastClickLatLng.lng.toFixed(5)}`);
    }
  };

  useEffect(() => {
    let map: L.Map | null = null;
    const subscription = mapStore.subscribe(value => {
      map = value;
      if (!map) return;

      map.on('move', () => displayMapPosition(map!));
      map.on('mousemove', (e: L.LeafletMouseEvent) => displayMapPosition(map!, e.latlng));
      map.on('click', (e: L.LeafletMouseEvent) => {
        setLastClickLatLng(e.latlng);
        displayMapPosition(map!);
      });
      map.on('load', () => displayMapPosition(map!));
    });

    return () => {
      subscription.unsubscribe();
      if (map) {
        map.off('move');
        map.off('mousemove');
        map.off('click');
        map.off('load');
      }
    };
  }, [mapStore]);

  const handleHideClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    setIsVisible(false);
  };

  const handleShowClick = (): void => {
    setIsVisible(true);
  };

  if (!isVisible) {
    return (
      <div id="show-map-position">
        <button onClick={handleShowClick}>Show Map Position</button>
      </div>
    );
  }

  return (
    <div id="map-position" style={{
      display: 'block',
      position: 'absolute',
      top: 0,
      right: '20px',
      padding: '0 5px',
      color: '#333',
      fontSize: '11px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      zIndex: 1000
    }}>
      <div id="map-position-inner">
        map center: {mapCenter}
        <a target="_blank" rel="noreferrer" href={viewOnOsmLink}>view on osm.org</a>
        <br />
        map zoom: {mapZoom}
        <br />
        viewbox: {mapViewbox}
        <br />
        last click: {lastClick}
        <br />
        mouse position: {mousePosition}
      </div>
      <div id="map-position-close" style={{ textAlign: 'right' }}>
        <a href="#hide" onClick={handleHideClick}>hide</a>
      </div>
    </div>
  );
};

export default MapPosition;