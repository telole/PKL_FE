import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, MapPin, Navigation, Search } from "lucide-react";
import MainPanel from "../../composables/nav/MainPanel";
import Sidebar from "../../composables/nav/Sidebar";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";

const DEFAULT_CENTER = [-6.2088, 106.8456];
const DEFAULT_ZOOM = 12;
const GEOCODE_CACHE_KEY = "companyGeocodeCache_v1";
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

export default function Location() {
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();
  const setErrorRef = useRef(setError);

  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [loadingData, setLoadingData] = useSetLoading(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [geocodingLocations, setGeocodingLocations] = useState(new Set());

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapInitializedRef = useRef(false);
  const scriptLoadedRef = useRef(false);
  const geocodeCacheRef = useRef({});
  const mapContainerRef = useRef(null);

  const initializeMap = useCallback(() => {
    if (mapInitializedRef.current || typeof window.L === "undefined") {
      return;
    }

    const mapContainer = document.getElementById("map");
    if (!mapContainer || mapContainer._leaflet_id) {
      return;
    }

    const map = window.L.map(mapContainer, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    mapInitializedRef.current = true;
    setMapReady(true);
  }, []);

  const cleanupMap = useCallback(() => {
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current = [];

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapInitializedRef.current = false;
    setMapReady(false);
  }, []);

  const ensureLeafletAssets = useCallback(() => {
    const cssSelector = 'link[href*="leaflet"]';
    if (!document.querySelector(cssSelector)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    const scriptSelector = 'script[src*="leaflet@1.9.4"]';
    const existingScript = document.querySelector(scriptSelector);

    const onLeafletReady = () => {
      scriptLoadedRef.current = true;
      setTimeout(() => initializeMap(), 100);
    };

    if (existingScript) {
      if (typeof window.L !== "undefined") {
        onLeafletReady();
      } else {
        existingScript.addEventListener("load", onLeafletReady, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.async = true;
    script.addEventListener("load", onLeafletReady);
    script.addEventListener("error", () => {
      setErrorRef.current("Gagal memuat komponen peta. Muat ulang halaman.");
    });

    document.body.appendChild(script);
  }, [initializeMap]);

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

  useEffect(() => {
    setErrorRef.current = setError;
  }, [setError]);

  useEffect(() => {
    ensureLeafletAssets();
    return () => {
      cleanupMap();
    };
  }, [ensureLeafletAssets, cleanupMap]);

  useEffect(() => {
    if (!mapInitializedRef.current || !mapRef.current || typeof window.L === "undefined") {
      return;
    }

    markersRef.current.forEach(({ marker }) => {
      marker.remove();
    });
    markersRef.current = [];

    const validLocations = locations.filter(hasCoordinates);
    if (!validLocations.length) {
      return;
    }

    validLocations.forEach((location) => {
      const marker = window.L.marker([location.lat, location.lng])
        .addTo(mapRef.current)
        .bindPopup(
          `<b>${location.name}</b><br>${location.address || "Alamat tidak tersedia"}`
        );

      markersRef.current.push({ id: location.id, marker });
    });

    if (validLocations.length === 1) {
      const [lat, lng] = [validLocations[0].lat, validLocations[0].lng];
      mapRef.current.setView([lat, lng], 15, { animate: true });
    } else {
      const bounds = window.L.latLngBounds(
        validLocations.map((location) => [location.lat, location.lng])
      );
      mapRef.current.fitBounds(bounds, { padding: [48, 48] });
    }
  }, [locations]);

  const filteredLocations = (() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return locations;

    return locations.filter((location) => {
      const haystack = [
        location.name,
        location.address,
        location.sector,
        location.specialist,
        location.contact_person,
        location.phone,
        location.email,
        location.website,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  })();

  const hasAnyCoordinates = locations.some(hasCoordinates);

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
            "User-Agent": "PKL-Location-Mapper/1.0"
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

    // Menggunakan Nominatim untuk geocoding (gratis, tidak perlu API key)
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
    let cancelled = false;

    const fetchLocations = async () => {
      setLoadingData(true);
      setErrorMessage(null);

      let normalized = [];

      try {
        const response = await axios.get(COMPANIES_ENDPOINT);
        const list = Array.isArray(response?.data?.data) ? response.data.data : [];
        normalized = list.map((item) => normalizeLocation(item));

        if (!cancelled) {
          setLocations(normalized);
        }
      } catch (err) {
        if (!cancelled) {
          const fallbackMessage = err?.response?.data?.message || "Gagal memuat data lokasi PKL.";
          setErrorMessage(fallbackMessage);
        }
        setErrorRef.current(err, "Gagal memuat data lokasi PKL.");
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }

      if (!cancelled && normalized.length) {
        const needsGeocode = normalized.some(
          (location) => !hasCoordinates(location) && (location.address || location.name)
        );

        if (needsGeocode) {
          try {
            // Geocoding batch untuk semua lokasi yang membutuhkan
            const enriched = await geocodeLocations(normalized);
            if (!cancelled) {
              setLocations(enriched);
            }
          } catch (err) {
            console.warn("Geocoding batch gagal", err);
            // Tetap set lokasi meskipun geocoding gagal
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

  function goToLocation(location) {
    if (!mapRef.current || !hasCoordinates(location)) {
      return;
    }

    mapRef.current.setView([location.lat, location.lng], 15, {
      animate: true,
      duration: 1,
    });

    const markerEntry = markersRef.current.find((entry) => entry.id === location.id);
    if (markerEntry?.marker) {
      markerEntry.marker.openPopup();
    }

    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openInGoogleMaps(location) {
    const query = encodeURIComponent(location.address || location.name || "Lokasi PKL");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  }

  const geocodeSingleLocation = useCallback(async (location) => {
    if (!location || hasCoordinates(location)) {
      return location;
    }

    if (!location.address && !location.name) {
      return location;
    }

    const query = location.address || location.name;
    const cacheKey = query;

    // Cek cache dulu
    const cached = geocodeCacheRef.current[cacheKey];
    if (cached) {
      return {
        ...location,
        lat: cached.lat,
        lng: cached.lng,
      };
    }

    // Tandai sedang geocoding
    setGeocodingLocations((prev) => new Set(prev).add(location.id));

    try {
      const coords = await geocodeAddress(query);
      
      if (coords) {
        // Simpan ke cache
        geocodeCacheRef.current[cacheKey] = coords;
        sessionStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(geocodeCacheRef.current));

        // Update lokasi di state
        setLocations((prevLocations) =>
          prevLocations.map((loc) =>
            loc.id === location.id
              ? { ...loc, lat: coords.lat, lng: coords.lng }
              : loc
          )
        );

        return {
          ...location,
          lat: coords.lat,
          lng: coords.lng,
        };
      } else {
        setErrorRef.current(
          `Tidak dapat menemukan koordinat untuk "${query}". Pastikan alamat lengkap dan valid.`
        );
      }
    } catch (err) {
      console.warn("Geocoding gagal untuk lokasi:", location.id, err);
      setErrorRef.current(
        `Gagal mencari koordinat untuk "${query}". Silakan coba lagi nanti atau gunakan Google Maps.`
      );
    } finally {
      setGeocodingLocations((prev) => {
        const next = new Set(prev);
        next.delete(location.id);
        return next;
      });
    }

    return location;
  }, [geocodeAddress]);

  async function handleGoToLocation(location) {
    // Jika sudah punya koordinat, langsung tampilkan
    if (hasCoordinates(location)) {
      goToLocation(location);
      return;
    }

    // Jika belum punya koordinat, coba geocoding dulu
    if (location.address || location.name) {
      const enriched = await geocodeSingleLocation(location);
      if (hasCoordinates(enriched)) {
        goToLocation(enriched);
      } else {
        setErrorRef.current(
          "Koordinat belum tersedia di peta / tidak dapat menemukan lokasi. Silakan gunakan tombol Google Maps untuk membuka alamat di Google Maps."
        );
      }
    } else {
      setErrorRef.current(
        "Alamat tidak tersedia. Tidak dapat mencari koordinat lokasi."
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainPanel />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Mapping Lokasi PKL</h2>
                <p className="text-gray-500 text-sm">
                  Temukan tempat praktek kerja lapangan yang sesuai dan akses peta virtual.
                </p>
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari lokasi, bidang, atau kontak..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div
            ref={mapContainerRef}
            className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden relative"
          >
            <div id="map" className="h-[500px] w-full" />

            {!mapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-gray-500">
                Memuat peta...
              </div>
            )}

            {mapReady && !loadingData && !hasAnyCoordinates && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-gray-500 p-6 text-center text-sm">
                Koordinat lokasi belum tersedia. Gunakan tombol Google Maps pada tabel untuk membuka alamat secara virtual.
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Daftar Lokasi PKL</h3>
              <p className="text-sm text-gray-500 mt-1">
                Klik aksi "Go to Location" untuk melihat posisi pada peta. Gunakan ikon Google Maps bila ingin membuka navigasi virtual.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Nama Perusahaan</th>
                    <th className="py-3 px-4 text-left font-medium">Alamat</th>
                    <th className="py-3 px-4 text-left font-medium">Bidang</th>
                    <th className="py-3 px-4 text-left font-medium">Spesialisasi</th>
                    <th className="py-3 px-4 text-left font-medium">Kuota</th>
                    <th className="py-3 px-4 text-left font-medium">Kontak</th>
                    <th className="py-3 px-4 text-center font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loadingData ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-500">
                        Memuat data lokasi...
                      </td>
                    </tr>
                  ) : filteredLocations.length ? (
                    filteredLocations.map((location) => (
                      <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>{location.name}</span>
                            {location.website && (
                              <a
                                href={location.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline break-all"
                              >
                                {location.website}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {location.address || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{location.sector || "-"}</td>
                        <td className="px-4 py-3 text-gray-700">{location.specialist || "-"}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {Number.isFinite(location.kuota) ? `${location.kuota} siswa` : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex flex-col gap-1 text-xs sm:text-sm">
                            {location.contact_person && (
                              <span className="font-medium text-gray-900">
                                {location.contact_person}
                              </span>
                            )}
                            {location.phone && <span>{location.phone}</span>}
                            {location.email && (
                              <a
                                href={`mailto:${location.email}`}
                                className="text-blue-600 hover:underline break-all"
                              >
                                {location.email}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                            <button
                              onClick={() => handleGoToLocation(location)}
                              disabled={geocodingLocations.has(location.id)}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-xs flex items-center gap-2 transition-colors"
                              title="Tampilkan pada peta"
                            >
                              {geocodingLocations.has(location.id) ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Mencari koordinat...
                                </>
                              ) : (
                                <>
                                  <Navigation className="w-4 h-4" />
                                  Go to Location
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openInGoogleMaps(location)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              title="Buka di Google Maps"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Google Maps
                            </button>
                          </div>
                          {!hasCoordinates(location) && !geocodingLocations.has(location.id) && (
                            <p className="mt-2 text-[11px] text-gray-500 text-center sm:text-left">
                              Koordinat akan dicari otomatis melalui alamat saat diklik.
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-500">
                        Tidak ada lokasi yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

