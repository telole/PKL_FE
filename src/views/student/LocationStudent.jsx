import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import StudentLayout from "../../composables/layouts/StudentLayout";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 12;
const GEOCODE_CACHE_KEY = "companyGeocodeCache_v1_student";
const COMPANIES_ENDPOINT = "companie";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function parseCoordinate(value) {
  if (value === undefined || value === null) return null;
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeLocation(raw) {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const lat =
    parseCoordinate(raw.lat) ||
    parseCoordinate(raw.latitude) ||
    parseCoordinate(raw.geo_lat);
  const lng =
    parseCoordinate(raw.lng) ||
    parseCoordinate(raw.longitude) ||
    parseCoordinate(raw.geo_lng);

  return {
    ...raw,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  };
}

function hasCoordinates(location) {
  return Number.isFinite(location?.lat) && Number.isFinite(location?.lng);
}

export default function LocationStudent() {
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();
  const setErrorRef = useRef(setError);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useSetLoading(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const setLoadingRef = useRef(setLoading);
  const axiosRef = useRef(axios);
  const geocodeLocationsRef = useRef(null);

  useEffect(() => {
    setLoadingRef.current = setLoading;
    axiosRef.current = axios;
  }, [setLoading, axios]);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userInteractedRef = useRef(false);
  const initialBoundsSetRef = useRef(false);
  const geocodeCacheRef = useRef({});

  useEffect(() => {
    setErrorRef.current = setError;
  }, [setError]);

  useEffect(() => {
    const cached = sessionStorage.getItem(GEOCODE_CACHE_KEY);
    if (cached) {
      try {
        geocodeCacheRef.current = JSON.parse(cached);
      } catch (err) {
        console.warn("Gagal membaca cache geocode", err);
        geocodeCacheRef.current = {};
      }
    }
  }, []);

  const geocodeWithNominatim = useCallback(async (query) => {
    if (!query) return null;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=0&limit=1`,
        { 
          headers: { 
            Accept: "application/json",
            "User-Agent": "PKL-Student-Location/1.0"
          } 
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseCoordinate(data[0].lat);
        const lng = parseCoordinate(data[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { lat, lng };
        }
      }
    } catch (err) {
      console.warn("Nominatim geocoding gagal untuk", query, err);
    }

    return null;
  }, []);

  const geocodeAddress = useCallback(async (query) => {
    if (!query) return null;
    return await geocodeWithNominatim(query);
  }, [geocodeWithNominatim]);

  const geocodeLocations = useCallback(
    async (list) => {
      if (!Array.isArray(list) || !list.length) {
        return [];
      }

      const results = [];
      for (const location of list) {
        let lat =
          parseCoordinate(location.lat) ||
          parseCoordinate(location.latitude) ||
          parseCoordinate(location.geo_lat);
        let lng =
          parseCoordinate(location.lng) ||
          parseCoordinate(location.longitude) ||
          parseCoordinate(location.geo_lng);

        if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && (location.address || location.name)) {
          const query = location.address || location.name;
          const cached = geocodeCacheRef.current[query];

          if (cached) {
            lat = cached.lat;
            lng = cached.lng;
          } else {
            const coords = await geocodeAddress(query);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
              geocodeCacheRef.current[query] = coords;
              sessionStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(geocodeCacheRef.current));
            }
            await delay(400);
          }
        }

        results.push({
          ...location,
          lat: Number.isFinite(lat) ? lat : null,
          lng: Number.isFinite(lng) ? lng : null,
        });
      }

      return results;
    },
    [geocodeAddress]
  );

  useEffect(() => {
    geocodeLocationsRef.current = geocodeLocations;
  }, [geocodeLocations]);

  useEffect(() => {
    let cancelled = false;

    const fetchLocations = async () => {
      setLoadingRef.current(true);
      setErrorMessage(null);

      let normalized = [];

      try {
        const response = await axiosRef.current.get(COMPANIES_ENDPOINT);
        
        // Handle different response structures
        let list = [];
        if (Array.isArray(response?.data?.data)) {
          list = response.data.data;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (response?.data?.companies && Array.isArray(response.data.companies)) {
          list = response.data.companies;
        }
        
        normalized = list.map((item) => normalizeLocation(item));

        if (!cancelled) {
          setLocations(normalized);
        }
      } catch (err) {
        console.error("Error fetching companies:", err);
        if (!cancelled) {
          const fallbackMessage = err?.response?.data?.message || err?.message || "Gagal memuat data lokasi PKL.";
          setErrorMessage(fallbackMessage);
        }
        setErrorRef.current(err, "Gagal memuat data lokasi PKL.");
      } finally {
        if (!cancelled) {
          setLoadingRef.current(false);
        }
      }

      if (!cancelled && normalized.length) {
        const needsGeocode = normalized.some(
          (location) => !hasCoordinates(location) && (location.address || location.name)
        );

        if (needsGeocode) {
          try {
            const enriched = await geocodeLocationsRef.current(normalized);
            if (!cancelled) {
              setLocations(enriched);
            }
          } catch (err) {
            console.warn("Geocoding batch gagal", err);
            if (!cancelled) {
              setLocations(normalized);
            }
          }
        }
      }
    };

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || loading) return;

    // Check if map container already has a map instance
    if (mapRef.current._leaflet_id) {
      return;
    }

    let map;
    try {
      map = L.map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Track user interactions (zoom, pan, etc.)
      map.on("zoomstart", () => {
        userInteractedRef.current = true;
      });
      map.on("dragstart", () => {
        userInteractedRef.current = true;
      });
      map.on("zoomend", () => {
        userInteractedRef.current = true;
      });
      map.on("moveend", () => {
        userInteractedRef.current = true;
      });

      mapInstanceRef.current = map;
      userInteractedRef.current = false;
      initialBoundsSetRef.current = false;
    } catch (error) {
      console.error("Error initializing map:", error);
      return;
    }

    return () => {
      // Cleanup markers first
      if (markersRef.current.length > 0 && map) {
        markersRef.current.forEach((marker) => {
          try {
            if (marker && map.hasLayer(marker)) {
              map.removeLayer(marker);
            }
          } catch (e) {
            // Ignore cleanup errors
          }
        });
        markersRef.current = [];
      }

      // Then cleanup map
      if (map) {
        try {
          map.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      mapInstanceRef.current = null;
    };
  }, [loading]);

  useEffect(() => {
    if (!mapInstanceRef.current || loading) return;

    const map = mapInstanceRef.current;

    // Check if map is still valid
    if (!map || !map._container || !map._container._leaflet_id) {
      return;
    }

    // Cleanup existing markers
    try {
      markersRef.current.forEach((marker) => {
        try {
          if (marker && map.hasLayer(marker)) {
            map.removeLayer(marker);
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
    } catch (e) {
      // Ignore cleanup errors
    }
    markersRef.current = [];

    // Add new markers - hanya yang punya koordinat
    const validLocations = locations.filter(hasCoordinates);
    
    try {
      validLocations.forEach((loc) => {
        try {
          const marker = L.marker([loc.lat, loc.lng])
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 8px;">${loc.name || "Nama tidak tersedia"}</h3>
                <p style="margin: 4px 0; font-size: 13px;">${loc.address || "Alamat tidak tersedia"}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Bidang:</strong> ${loc.sector || "-"}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Spesialisasi:</strong> ${loc.specialist || "-"}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Kuota:</strong> ${loc.kuota || 0} siswa</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Kontak:</strong> ${loc.contact_person || "-"} ${loc.phone ? `(${loc.phone})` : ""}</p>
              </div>
            `);
          markersRef.current.push(marker);
        } catch (e) {
          console.warn("Error adding marker:", e);
        }
      });
    } catch (e) {
      console.error("Error processing markers:", e);
    }

    // Fit bounds untuk semua marker yang valid
    if (
      validLocations.length > 0 &&
      !userInteractedRef.current &&
      !initialBoundsSetRef.current &&
      map &&
      map._container &&
      map._container._leaflet_id
    ) {
      try {
        const coordinatePairs = validLocations
          .map((loc) => [loc.lat, loc.lng])
          .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
        
        if (coordinatePairs.length > 0) {
          const bounds = L.latLngBounds(coordinatePairs);
          setTimeout(() => {
            if (map && map._container && map._container._leaflet_id) {
              try {
                map.fitBounds(bounds, { padding: [50, 50] });
                initialBoundsSetRef.current = true;
              } catch (e) {
                console.warn("Error fitting bounds:", e);
              }
            }
          }, 100);
        }
      } catch (e) {
        console.warn("Error calculating bounds:", e);
      }
    }
  }, [locations, loading]);

  const uniqueSectors = useMemo(() => {
    const sectors = [...new Set(locations.map((loc) => loc.sector).filter(Boolean))];
    return sectors.sort();
  }, [locations]);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery && !filterType) return locations;

    return locations.filter((loc) => {
      const matchesSearch = !normalizedQuery || [
        loc.name,
        loc.address,
        loc.sector,
        loc.specialist,
        loc.contact_person,
        loc.phone,
        loc.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      
      const matchesType = !filterType || loc.sector === filterType;
      return matchesSearch && matchesType;
    });
  }, [locations, searchQuery, filterType]);

  return (
    <StudentLayout>
      <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lokasi PKL</h1>
        <p className="text-gray-600 mt-1">Temukan tempat praktek kerja lapangan yang sesuai</p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Cari lokasi atau bidang PKL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="block rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          <option value="">Semua Bidang</option>
          {uniqueSectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      {/* MAP */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Memuat peta...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} id="map" style={{ height: "450px", width: "100%" }}></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Daftar Lokasi PKL
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Nama Perusahaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Bidang
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Kuota
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Kontak
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-sm text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-sm text-center text-gray-500">
                    Tidak ada lokasi yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span>{loc.name || "-"}</span>
                        {loc.website && (
                          <a
                            href={loc.website.startsWith("http") ? loc.website : `https://${loc.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all mt-1"
                          >
                            {loc.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{loc.address || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <div>{loc.sector || "-"}</div>
                        {loc.specialist && (
                          <div className="text-xs text-gray-400 mt-1">{loc.specialist}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {Number.isFinite(loc.kuota) ? `${loc.kuota} siswa` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        {loc.contact_person && (
                          <span className="font-medium text-gray-900">{loc.contact_person}</span>
                        )}
                        {loc.phone && <span className="ml-1">{loc.phone}</span>}
                        {loc.email && (
                          <a
                            href={`mailto:${loc.email}`}
                            className="text-blue-600 hover:underline break-all block text-xs mt-1"
                          >
                            {loc.email}
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </StudentLayout>
  );
}
