"use client";

import { useEffect, useRef } from "react";

type SelectedLocation = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

type LocationPickerProps = {
  value: SelectedLocation | null;
  onChange: (value: SelectedLocation) => void;
};

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mapInstance: any;
    let marker: any;

    async function setupMap() {
      if (!mapRef.current) {
        return;
      }

      const L = await import("leaflet");

      mapInstance = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(mapInstance);

      const pinIcon = L.divIcon({
        className: "",
        html: '<div style="width:18px;height:18px;border-radius:999px;background:#b98941;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.18)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      async function setLocation(lat: number, lng: number) {
        if (!mapInstance) {
          return;
        }

        if (!marker) {
          marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(mapInstance);
          marker.on("dragend", async () => {
            const next = marker.getLatLng();
            await setLocation(next.lat, next.lng);
          });
        } else {
          marker.setLatLng([lat, lng]);
        }

        mapInstance.setView([lat, lng], Math.max(mapInstance.getZoom(), 15));

        let formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
              headers: {
                Accept: "application/json"
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            formattedAddress = data.display_name ?? formattedAddress;
          }
        } catch {
          formattedAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        onChange({
          latitude: lat,
          longitude: lng,
          formattedAddress
        });
      }

      mapInstance.on("click", async (event: any) => {
        await setLocation(event.latlng.lat, event.latlng.lng);
      });

      if (value) {
        await setLocation(value.latitude, value.longitude);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await setLocation(position.coords.latitude, position.coords.longitude);
          },
          () => {
            mapInstance.setView([20.5937, 78.9629], 5);
          }
        );
      }
    }

    void setupMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [onChange, value]);

  return (
    <div className="map-shell">
      <div ref={mapRef} className="map-box" />
      <p className="helper-text">Tap or click the map to place a pin. You can drag the pin to refine the location.</p>
    </div>
  );
}
