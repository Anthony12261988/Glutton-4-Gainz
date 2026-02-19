"use client";

import { useEffect, useRef, useCallback } from "react";
import type { CoachProfile } from "@/lib/queries/coaches";
import "leaflet/dist/leaflet.css";

interface CoachWithDistance extends CoachProfile {
  distanceMiles?: number | null;
}

interface CoachMapProps {
  coaches: CoachWithDistance[];
  userLocation: { lat: number; lng: number } | null;
  highlightedId: string | null;
  onMarkerClick: (id: string) => void;
}

export default function CoachMap({
  coaches,
  userLocation,
  highlightedId,
  onMarkerClick,
}: CoachMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, any>>({});
  const userMarkerRef = useRef<any>(null);
  // Store callback in a ref so marker effects don't re-run when parent re-renders
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => { onMarkerClickRef.current = onMarkerClick; });

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const L = require("leaflet");

    // Fix default icon paths broken by webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [39.5, -98.35], // Center of USA
      zoom: 4,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    mapRef.current = map;
  }, []);

  // Update CO markers when coaches list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = require("leaflet");

    // Remove old markers
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    const bounds: [number, number][] = [];

    coaches.forEach((coach) => {
      if (coach.latitude === null || coach.longitude === null) return;

      const isHighlighted = highlightedId === coach.id;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width: ${isHighlighted ? "18px" : "14px"};
          height: ${isHighlighted ? "18px" : "14px"};
          background: ${isHighlighted ? "#D32F2F" : "#9b1c1c"};
          border: 2px solid ${isHighlighted ? "#fff" : "#D32F2F"};
          border-radius: 50%;
          box-shadow: 0 0 ${isHighlighted ? "8px" : "4px"} rgba(211,47,47,0.6);
          transition: all 0.2s;
        "></div>`,
        iconSize: [isHighlighted ? 18 : 14, isHighlighted ? 18 : 14],
        iconAnchor: [isHighlighted ? 9 : 7, isHighlighted ? 9 : 7],
      });

      const marker = L.marker([coach.latitude, coach.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:140px">
            <strong style="text-transform:uppercase;letter-spacing:0.05em">${coach.displayName}</strong>
            ${coach.location ? `<br/><span style="font-size:11px;color:#888">${coach.location}</span>` : ""}
            ${coach.distanceMiles != null ? `<br/><span style="font-size:11px;color:#D32F2F">${coach.distanceMiles.toFixed(1)} mi away</span>` : ""}
          </div>`,
          { maxWidth: 200 }
        )
        .on("click", () => onMarkerClickRef.current(coach.id));

      markersRef.current[coach.id] = marker;
      bounds.push([coach.latitude, coach.longitude]);
    });

    // Add user location to bounds if present
    if (userLocation) {
      bounds.push([userLocation.lat, userLocation.lng]);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [coaches, userLocation, highlightedId]);

  // Update user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = require("leaflet");

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width: 16px;
          height: 16px;
          background: #FFFFFF;
          border: 3px solid #D32F2F;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(255,255,255,0.8);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon,
      })
        .addTo(map)
        .bindPopup(
          '<div style="font-family:sans-serif"><strong>Your Position</strong></div>'
        );
    }
  }, [userLocation]);

  // Pan to highlighted marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !highlightedId) return;
    const marker = markersRef.current[highlightedId];
    if (marker) {
      map.panTo(marker.getLatLng(), { animate: true });
      marker.openPopup();
    }
  }, [highlightedId]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full"
      style={{ minHeight: "400px" }}
    />
  );
}
