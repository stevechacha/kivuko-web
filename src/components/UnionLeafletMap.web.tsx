import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import type { MapConnection } from '../api/client';
import { colors } from '../theme/colors';

const REGION_COORDS: Record<string, [number, number]> = {
  Mwanza: [-2.5164, 32.9175],
  Dodoma: [-6.163, 35.7516],
  Mbeya: [-8.9, 33.45],
  'Dar es Salaam': [-6.7924, 39.2083],
  Morogoro: [-6.827, 37.659],
  Unguja: [-6.1659, 39.2026],
  Pemba: [-5.031, 39.775],
  Kigoma: [-4.876, 29.626],
};

type Props = {
  connections: MapConnection[];
  height?: number;
};

export default function UnionLeafletMap({ connections, height = 380 }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const L = await import('leaflet');
      if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (cancelled || !hostRef.current || mapRef.current) return;

      const map = L.map(hostRef.current, { scrollWheelZoom: false }).setView([-6.5, 35.5], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 10,
      }).addTo(map);

      Object.entries(REGION_COORDS).forEach(([name, [lat, lng]]) => {
        L.circleMarker([lat, lng], {
          radius: 7,
          color: colors.green,
          fillColor: colors.gold,
          fillOpacity: 0.85,
          weight: 2,
        })
          .bindTooltip(name, { permanent: false })
          .addTo(map);
      });

      connections.forEach((c, i) => {
        const from = REGION_COORDS[c.from_region] ?? [-6.5, 35.5];
        const to = REGION_COORDS[c.to_region] ?? [-6.16, 39.2];
        L.polyline([from, to], {
          color: i % 2 === 0 ? colors.gold : colors.blue,
          weight: 3,
          opacity: 0.85,
        }).addTo(map);
      });

      mapRef.current = map;
    };

    init();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [connections]);

  return (
    <View style={styles.wrap}>
      <div ref={hostRef} style={{ height, width: '100%', borderRadius: 12, overflow: 'hidden' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', marginVertical: 8 },
});
