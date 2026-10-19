import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pin = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:999px;background:#7a9e8a;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.2)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

export default function TripMap({ plan, activeDay }) {
  const points = useMemo(() => {
    const days = activeDay ? plan.days.filter((d) => d.day_number === activeDay) : plan.days
    const list = []
    days.forEach((day) => {
      day.items.forEach((item) => {
        if (item.location_coords?.lat && item.location_coords?.lon) {
          list.push({
            lat: item.location_coords.lat,
            lon: item.location_coords.lon,
            label: item.activity_name,
            place: item.location_name,
            day: day.day_number,
          })
        }
      })
    })
    return list
  }, [plan, activeDay])

  const center = plan.destination_coords
    ? [plan.destination_coords.lat, plan.destination_coords.lon]
    : points[0]
      ? [points[0].lat, points[0].lon]
      : [20.5937, 78.9629]

  const line = points.map((p) => [p.lat, p.lon])

  return (
    <div className="h-72 overflow-hidden rounded-2xl md:h-80">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {line.length > 1 && <Polyline positions={line} pathOptions={{ color: '#8B7BA3', weight: 3, opacity: 0.8 }} />}
        {points.map((p, i) => (
          <Marker key={`${p.lat}-${p.lon}-${i}`} position={[p.lat, p.lon]} icon={pin}>
            <Popup>
              <strong>Day {p.day}:</strong> {p.label}
              <br />
              {p.place}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
