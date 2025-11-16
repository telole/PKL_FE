import { useEffect, useState, useRef, useMemo } from "react";
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

// Default position untuk Semarang (karena sebagian besar perusahaan di Semarang)
const DEFAULT_CENTER = [-7.0051, 110.4381];
const DEFAULT_ZOOM = 12;

export default function LocationStudent() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userInteractedRef = useRef(false);
  const initialBoundsSetRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useSetLoading(true);
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get("companie");
        const companies = response.data.data || [];
        
        const transformedCompanies = companies.map((company) => {
          return {
            id: company.id,
            name: company.name,
            address: company.address,
            type: company.sector || "Lainnya",
            slots: company.kuota || 0,
            contact: company.phone || "-",
            contactPerson: company.contact_person || "-",
            email: company.email || "-",
            website: company.website || "-",
            specialist: company.specialist || "-",
            description: company.description || "-",
            position: DEFAULT_CENTER, // Use default initially
          };
        });

        setLocations(transformedCompanies);

        const geocodeCompanies = async () => {
          const geocodedCompanies = await Promise.all(
            companies.map(async (company, index) => {
              let position = DEFAULT_CENTER;
              try {
                // Sequential geocoding to avoid rate limiting
                if (index > 0) {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                }
                const encodedAddress = encodeURIComponent(company.address);
                const geocodeResponse = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
                  {
                    headers: {
                      "User-Agent": "PKL-Student-App",
                    },
                  }
                );
                const geocodeData = await geocodeResponse.json();
                if (geocodeData && geocodeData.length > 0) {
                  position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
                }
              } catch (geocodeError) {
                // Silently fail, use default position
              }
              return {
                ...transformedCompanies[index],
                position,
              };
            })
          );
          setLocations(geocodedCompanies);
        };

        // Start geocoding in background (non-blocking)
        geocodeCompanies();
      } catch (err) {
        setError(err, "Gagal memuat data perusahaan.");
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
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

    // Add new markers
    try {
      locations.forEach((loc) => {
        if (!loc.position || !Array.isArray(loc.position) || loc.position.length !== 2) {
          return; // Skip invalid positions
        }

        try {
          const marker = L.marker(loc.position)
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 8px;">${loc.name}</h3>
                <p style="margin: 4px 0; font-size: 13px;">${loc.address}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Bidang:</strong> ${loc.type}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Spesialisasi:</strong> ${loc.specialist}</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Kuota:</strong> ${loc.slots} siswa</p>
                <p style="margin: 4px 0; font-size: 13px;"><strong>Kontak:</strong> ${loc.contactPerson} (${loc.contact})</p>
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

    
    if (
      locations.length > 0 &&
      !userInteractedRef.current &&
      !initialBoundsSetRef.current &&
      map &&
      map._container &&
      map._container._leaflet_id
    ) {
      try {
        const validPositions = locations
          .map((loc) => loc.position)
          .filter((pos) => pos && Array.isArray(pos) && pos.length === 2);
        
        if (validPositions.length > 0) {
          const bounds = L.latLngBounds(validPositions);
          // Use setTimeout to ensure map is fully ready
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
    const sectors = [...new Set(locations.map((loc) => loc.type).filter(Boolean))];
    return sectors.sort();
  }, [locations]);

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      searchQuery === "" ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.specialist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "" || loc.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <StudentLayout>
      <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lokasi PKL</h1>
        <p className="text-gray-600 mt-1">Temukan tempat praktek kerja lapangan yang sesuai</p>
      </div>

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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{loc.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{loc.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <div>{loc.type}</div>
                        {loc.specialist && (
                          <div className="text-xs text-gray-400 mt-1">{loc.specialist}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{loc.slots} siswa</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>
                        <div>{loc.contactPerson}</div>
                        <div className="text-xs text-gray-400">{loc.contact}</div>
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
