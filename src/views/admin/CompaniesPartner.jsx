import { useEffect, useMemo, useState } from "react";
import { Building2, Search, Plus, Check, Edit3, Trash2, Briefcase, Phone, Mail, Globe, Users, Loader2 } from "lucide-react";
import MainPanel from "../../composables/nav/MainPanel";
import Sidebar from "../../composables/nav/Sidebar";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";

const COMPANIES_ENDPOINT = "companie";

export default function CompaniesPartner() {
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useSetLoading(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCompanies = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response = await axios.get(COMPANIES_ENDPOINT);
        const data = Array.isArray(response?.data?.data) ? response.data.data : [];

        if (!cancelled) {
          setCompanies(data);
        }
      } catch (err) {
        if (!cancelled) {
          const fallbackMessage = err?.response?.data?.message || "Gagal memuat data perusahaan partner.";
          setErrorMessage(fallbackMessage);
        }
        setError(err, "Gagal memuat data perusahaan partner.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      cancelled = true;
    };
  }, [axios, setError, setLoading]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;

    const normalizedQuery = searchQuery.trim().toLowerCase();
    return companies.filter((company) => {
      const searchableText = [
        company.name,
        company.address,
        company.contact_person,
        company.phone,
        company.email,
        company.sector,
        company.specialist,
        company.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [companies, searchQuery]);

  const LoadingSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 animate-pulse">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="bg-gray-50 px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainPanel />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-10 h-10 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Manajemen Perusahaan Partner</h2>
                <p className="text-gray-500 text-sm">Kelola daftar perusahaan partner beserta detail siswa dan pembimbing PKL</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-1" />
              Tambah
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex justify-between items-center">
            <div className="relative w-[78%]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari perusahaan berdasarkan nama, alamat, kontak, atau spesialisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Tambah Perusahaan
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div>
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-gray-600 font-medium">Memuat data perusahaan...</p>
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg mb-2">
                {searchQuery ? "Tidak ada perusahaan yang cocok dengan pencarian" : "Belum ada perusahaan partner"}
              </p>
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian Anda"
                  : "Klik tombol 'Tambah Perusahaan' untuk menambahkan perusahaan partner baru"}
              </p>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 relative">
                {/* Header */}
                <div className="flex justify-between items-start p-6 relative">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{company.name}</h3>
                      <p className="text-gray-500 text-sm">{company.description || "Perusahaan partner PKL"}</p>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 flex gap-3 items-center">
                    <Check className="w-6 h-6 text-green-600" />
                    <button className="text-blue-600 hover:text-blue-800 transition-colors">
                      <Edit3 className="w-6 h-6" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 transition-colors">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 flex items-center px-6 py-4">
                  <p className="font-medium text-gray-700 w-1/3">Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <p className="text-green-700 font-semibold">Aktif</p>
                  </div>
                </div>

                <div className="bg-white flex items-start px-6 py-4">
                  <p className="font-medium text-gray-700 w-1/3">Kontak</p>
                  <div className="w-2/3 text-gray-800 space-y-2">
                    {company.contact_person && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-600" />
                        <p>{company.contact_person}</p>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <p>{company.phone}</p>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <p>{company.email}</p>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <a
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-start gap-2 mt-2">
                        <Briefcase className="w-4 h-4 text-gray-600 mt-0.5" />
                        <p className="text-sm text-gray-600">{company.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 flex items-start px-6 py-4">
                  <p className="font-medium text-gray-700 w-1/3">Informasi</p>
                  <div className="w-2/3 text-gray-800 space-y-2">
                    {company.sector && (
                      <div>
                        <span className="text-gray-600 text-sm">Bidang: </span>
                        <span className="font-medium">{company.sector}</span>
                      </div>
                    )}
                    {company.specialist && (
                      <div>
                        <span className="text-gray-600 text-sm">Spesialisasi: </span>
                        <span className="font-medium">{company.specialist}</span>
                      </div>
                    )}
                    {company.kuota !== undefined && (
                      <div>
                        <span className="text-gray-600 text-sm">Kuota: </span>
                        <span className="font-medium">{company.kuota} siswa</span>
                      </div>
                    )}
                  </div>
                </div>

                {company.supervisors && company.supervisors.length > 0 && (
                  <div className="bg-white flex items-start px-6 py-4 border-t">
                    <p className="font-medium text-gray-700 w-1/3">Pembimbing</p>
                    <div className="w-2/3 text-gray-800 space-y-2">
                      {company.supervisors.map((supervisor, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="font-medium">{supervisor.position || "Pembimbing PKL"}</p>
                            {supervisor.phone && (
                              <p className="text-sm text-gray-600">{supervisor.phone}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-100">
                  <p className="text-gray-600 font-medium">
                    Total: {company.supervisors?.length || 0} pembimbing, {company.kuota || 0} slot kuota
                  </p>
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Tambah Posisi
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
