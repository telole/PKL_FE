import { useEffect, useMemo, useState, useCallback } from "react";
import { Calendar, Download, Filter, Loader2, RefreshCw, Search, Eye, X, CheckCircle2, XCircle } from "lucide-react";
import Sidebar from "../../composables/nav/Sidebar";
import MainPanel from "../../composables/nav/MainPanel";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";
import { useToast } from "../../composables/hooks/useToast";

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "hadir", label: "Hadir" },
  { value: "sakit", label: "Sakit" },
  { value: "izin", label: "Izin" },
  { value: "alpha", label: "Alpha" },
  { value: "terlambat", label: "Terlambat" },
  { value: "pulang_cepat", label: "Pulang Cepat" },
];

const approvalOptions = [
  { value: "", label: "Semua Approval" },
  { value: "pending", label: "Menunggu" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
];

export default function PresenceAdmin() {
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();
  const [loading, setLoading] = useSetLoading(true);
  const { showNotif } = useToast();

  const [presences, setPresences] = useState([]);
  const [filteredPresences, setFilteredPresences] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    approval_status: "",
    tanggal: "",
    start_date: "",
    end_date: "",
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const buildParams = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.approval_status) params.approval_status = filters.approval_status;
    if (filters.tanggal) params.tanggal = filters.tanggal;
    if (filters.start_date && filters.end_date) {
      params.start_date = filters.start_date;
      params.end_date = filters.end_date;
    }
    return params;
  }, []);

  const fetchPresences = useCallback(async () => {
    try {
      setLoading(true);
      const params = buildParams();
      const response = await axios.get("presences", { params });
      const list = response.data.data || [];
      setPresences(list);
      setFilteredPresences(list);
    } catch (err) {
      setError(err, "Gagal memuat data presensi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresences();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPresences(presences);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = presences.filter((presence) => {
      const studentName = presence?.student?.users?.full_name?.toLowerCase() || "";
      const companyName = presence?.internship?.company?.name?.toLowerCase() || "";
      const status = presence?.status?.toLowerCase() || "";
      return (
        studentName.includes(term) ||
        companyName.includes(term) ||
        status.includes(term)
      );
    });
    setFilteredPresences(filtered);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      approval_status: "",
      tanggal: "",
      start_date: "",
      end_date: "",
    });
    setSearchTerm("");
  };

  const handleViewDetail = (presence) => {
    setSelectedPresence(presence);
    setRejectionReason(presence.rejection_reason || "");
    setDetailModalOpen(true);
  };

  const statusBadge = (status) => {
    const config = {
      hadir: { text: "Hadir", color: "bg-green-100 text-green-800" },
      sakit: { text: "Sakit", color: "bg-yellow-100 text-yellow-800" },
      izin: { text: "Izin", color: "bg-blue-100 text-blue-800" },
      alpha: { text: "Alpha", color: "bg-red-100 text-red-800" },
      terlambat: { text: "Terlambat", color: "bg-orange-100 text-orange-800" },
      pulang_cepat: { text: "Pulang Cepat", color: "bg-purple-100 text-purple-800" },
    };
    const chosen = config[status] || { text: status || "-", color: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${chosen.color}`}>{chosen.text}</span>;
  };

  const approvalBadge = (approval) => {
    const config = {
      approved: { text: "Disetujui", color: "bg-green-100 text-green-800" },
      pending: { text: "Menunggu", color: "bg-yellow-100 text-yellow-800" },
      rejected: { text: "Ditolak", color: "bg-red-100 text-red-800" },
    };
    const chosen = config[approval] || { text: approval || "-", color: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${chosen.color}`}>{chosen.text}</span>;
  };

  const handleApproval = async (action) => {
    if (!selectedPresence) return;

    if (action === "reject" && !rejectionReason.trim()) {
      showNotif("warning", "Alasan penolakan wajib diisi untuk menolak presensi.");
      return;
    }

    try {
      setApprovalLoading(true);
      const payload =
        action === "approve"
          ? { action: "approve" }
          : { action: "reject", rejection_reason: rejectionReason };

      const res = await axios.post(`presences/${selectedPresence.id}/approve`, payload);
      const updated = res.data.data;

      // Update list dan detail yang sedang dibuka
      setPresences((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setFilteredPresences((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedPresence(updated);

      showNotif("success", res.data.message || "Status approval berhasil diperbarui.");
    } catch (err) {
      setError(err, "Gagal mengubah status approval presensi.");
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const params = buildParams();
      const response = await axios.get("presences/export/excel", {
        params,
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers["content-disposition"];
      let filename = "presensi.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotif("success", "Data presensi berhasil diexport.");
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err, err.response?.data?.message || "Anda tidak memiliki akses untuk export.");
      } else {
        setError(err, "Gagal mengekspor data presensi.");
      }
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainPanel />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Monitoring Presensi
              </h2>
              <p className="text-gray-600">
                Pantau seluruh presensi siswa, lihat detail, dan unduh data ke Excel.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyiapkan...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Excel
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  Cari Siswa / Perusahaan
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nama siswa, perusahaan, atau status"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Filter className="w-4 h-4 text-gray-400" />
                  Status Presensi
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Filter className="w-4 h-4 text-gray-400" />
                  Status Approval
                </label>
                <select
                  name="approval_status"
                  value={filters.approval_status}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {approvalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Tanggal Spesifik</label>
                <input
                  type="date"
                  name="tanggal"
                  value={filters.tanggal}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  min={filters.start_date || undefined}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Siswa</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Perusahaan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Approval</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredPresences.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                        Tidak ada data presensi sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPresences.map((presence) => (
                      <tr key={presence.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(presence.tanggal).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-900">{presence?.student?.users?.full_name || "-"}</p>
                          <p className="text-xs text-gray-500">NIS: {presence?.student?.nis || "-"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">{presence?.internship?.company?.name || "-"}</p>
                          <p className="text-xs text-gray-500">{presence?.internship?.teacher?.users?.full_name || "Pembimbing tidak tersedia"}</p>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {statusBadge(presence.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {approvalBadge(presence.approval_status)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleViewDetail(presence)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {detailModalOpen && selectedPresence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Detail Presensi</h3>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedPresence(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Tanggal">
                  {new Date(selectedPresence.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </DetailItem>
                <DetailItem label="Status">{statusBadge(selectedPresence.status)}</DetailItem>
                <DetailItem label="Nama Siswa">{selectedPresence?.student?.users?.full_name || "-"}</DetailItem>
                <DetailItem label="NIS">{selectedPresence?.student?.nis || "-"}</DetailItem>
                <DetailItem label="Perusahaan">{selectedPresence?.internship?.company?.name || "-"}</DetailItem>
                <DetailItem label="Pembimbing">{selectedPresence?.internship?.teacher?.users?.full_name || "-"}</DetailItem>
                <DetailItem label="Jam Masuk">{selectedPresence.jam_masuk || "-"}</DetailItem>
                <DetailItem label="Jam Keluar">{selectedPresence.jam_keluar || "-"}</DetailItem>
                <DetailItem label="Status Approval">{approvalBadge(selectedPresence.approval_status)}</DetailItem>
                <DetailItem label="Disetujui Oleh">{selectedPresence?.approver?.full_name || "-"}</DetailItem>
                <DetailItem label="Tanggal Approval">
                  {selectedPresence.approved_at
                    ? new Date(selectedPresence.approved_at).toLocaleString("id-ID")
                    : "-"}
                </DetailItem>
              </div>
              <DetailItem label="Keterangan">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedPresence.keterangan || "Tidak ada keterangan"}
                </p>
              </DetailItem>
              {selectedPresence.rejection_reason && (
                <DetailItem label="Alasan Penolakan">
                  <p className="text-sm text-red-600">{selectedPresence.rejection_reason}</p>
                </DetailItem>
              )}
              {selectedPresence.file_bukti && (
                <DetailItem label="File Bukti">
                  <a
                    href={`http://127.0.0.1:8000/storage/${selectedPresence.file_bukti}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Lihat Lampiran
                  </a>
                </DetailItem>
              )}
              {selectedPresence.approval_status === "pending" && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <p className="text-sm font-semibold text-gray-800">
                    Ubah Status Approval
                  </p>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Alasan Penolakan (isi jika ingin menolak)
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Tuliskan alasan penolakan jika presensi tidak disetujui..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleApproval("reject")}
                      disabled={approvalLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                    >
                      {approvalLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApproval("approve")}
                      disabled={approvalLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {approvalLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Setujui
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedPresence(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, children }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500 font-semibold mb-1">{label}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}


