import { useEffect, useState, useMemo, useRef } from "react";
import { Calendar, Plus, Edit2, Trash2, Eye, Clock, FileText, CheckCircle, XCircle, AlertCircle, Loader2, X } from "lucide-react";
import StudentLayout from "../../composables/layouts/StudentLayout";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";
import { useToast } from "../../composables/hooks/useToast";
import { useConfirmModal } from "../../composables/hooks/useConfirmModal";

export default function PresenceStudent() {
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();
  const [loading, setLoading] = useSetLoading(true);
  const { showNotif } = useToast();
  const { confirm, ConfirmModal } = useConfirmModal();

  const [presences, setPresences] = useState([]);
  const [activeInternship, setActiveInternship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [form, setForm] = useState({
    internship_id: "",
    tanggal: "",
    status: "hadir",
    jam_masuk: "",
    jam_keluar: "",
    keterangan: "",
    file_bukti: null,
  });

  const [errors, setErrors] = useState({});

  // Refs untuk menghindari infinite loop
  const axiosRef = useRef(axios);
  const setErrorRef = useRef(setError);
  const setLoadingRef = useRef(setLoading);

  useEffect(() => {
    axiosRef.current = axios;
    setErrorRef.current = setError;
    setLoadingRef.current = setLoading;
  }, []);

  // Fetch internships
  useEffect(() => {
    let cancelled = false;

    const fetchInternships = async () => {
      try {
        const response = await axiosRef.current.get("intern");
        const allInternships = response.data.data || [];
        const active = allInternships.find(
          (i) => i.status === "approved" || i.status === "in_progress"
        );
        if (!cancelled && active) {
          setActiveInternship(active);
          setForm((prev) => ({ ...prev, internship_id: active.id }));
        }
      } catch (err) {
        if (!cancelled) {
          setErrorRef.current(err, "Gagal memuat data PKL.");
        }
      }
    };

    fetchInternships();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch presences
  useEffect(() => {
    if (!activeInternship?.id) return;

    let cancelled = false;

    const fetchPresences = async () => {
      try {
        setLoadingRef.current(true);
        const params = {};
        if (activeInternship?.id) {
          params.internship_id = activeInternship.id;
        }
        if (filterStatus) {
          params.status = filterStatus;
        }
        if (filterDate) {
          params.tanggal = filterDate;
        }

        const response = await axiosRef.current.get("presences", { params });
        if (!cancelled) {
          setPresences(response.data.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorRef.current(err, "Gagal memuat data presensi.");
        }
      } finally {
        if (!cancelled) {
          setLoadingRef.current(false);
        }
      }
    };

    fetchPresences();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const maxSize = 2 * 1024 * 1024; // 2MB
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          file_bukti: "Ukuran file maksimal 2MB",
        }));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          file_bukti: "File harus berupa PDF, JPG, atau PNG",
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        file_bukti: file,
      }));

      if (errors.file_bukti) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file_bukti;
          return newErrors;
        });
      }
    }
  };

  const handleOpenModal = (presence = null) => {
    if (presence) {
      setSelectedPresence(presence);
      setForm({
        internship_id: presence.internship_id,
        tanggal: presence.tanggal,
        status: presence.status,
        jam_masuk: presence.jam_masuk || "",
        jam_keluar: presence.jam_keluar || "",
        keterangan: presence.keterangan || "",
        file_bukti: null,
      });
    } else {
      setSelectedPresence(null);
      setForm({
        internship_id: activeInternship?.id || "",
        tanggal: new Date().toISOString().split("T")[0],
        status: "hadir",
        jam_masuk: "",
        jam_keluar: "",
        keterangan: "",
        file_bukti: null,
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPresence(null);
    setForm({
      internship_id: activeInternship?.id || "",
      tanggal: "",
      status: "hadir",
      jam_masuk: "",
      jam_keluar: "",
      keterangan: "",
      file_bukti: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("internship_id", form.internship_id);
      formData.append("tanggal", form.tanggal);
      formData.append("status", form.status);
      if (form.jam_masuk) formData.append("jam_masuk", form.jam_masuk);
      if (form.jam_keluar) formData.append("jam_keluar", form.jam_keluar);
      if (form.keterangan) formData.append("keterangan", form.keterangan);
      if (form.file_bukti) formData.append("file_bukti", form.file_bukti);

      if (selectedPresence) {
        // Update
        const response = await axios.put(`presences/${selectedPresence.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showNotif("success", response.data.message || "Presensi berhasil diupdate.");
      } else {
        // Create
        const response = await axios.post("presences", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showNotif("success", response.data.message || "Presensi berhasil ditambahkan.");
      }

      handleCloseModal();
      
      // Refresh presences
      if (activeInternship?.id) {
        const params = {};
        params.internship_id = activeInternship.id;
        if (filterStatus) params.status = filterStatus;
        if (filterDate) params.tanggal = filterDate;
        
        try {
          setLoading(true);
          const response = await axios.get("presences", { params });
          setPresences(response.data.data || []);
        } catch (err) {
          setError(err, "Gagal memuat data presensi.");
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors || {};
        setErrors(validationErrors);
      } else {
        const errorMessage = err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.";
        setError(err, errorMessage);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (presence) => {
    const confirmed = await confirm(
      "Hapus Presensi",
      `Apakah Anda yakin ingin menghapus presensi tanggal ${new Date(presence.tanggal).toLocaleDateString("id-ID")}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await axios.delete(`presences/${presence.id}`);
      showNotif("success", "Presensi berhasil dihapus.");
      
      // Refresh presences
      if (activeInternship?.id) {
        const params = {};
        params.internship_id = activeInternship.id;
        if (filterStatus) params.status = filterStatus;
        if (filterDate) params.tanggal = filterDate;
        
        try {
          const response = await axios.get("presences", { params });
          setPresences(response.data.data || []);
        } catch (err) {
          setError(err, "Gagal memuat data presensi.");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Gagal menghapus presensi.";
      setError(err, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (presence) => {
    setSelectedPresence(presence);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      hadir: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Hadir" },
      sakit: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, label: "Sakit" },
      izin: { color: "bg-blue-100 text-blue-800", icon: AlertCircle, label: "Izin" },
      alpha: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Alpha" },
      terlambat: { color: "bg-orange-100 text-orange-800", icon: Clock, label: "Terlambat" },
      pulang_cepat: { color: "bg-purple-100 text-purple-800", icon: Clock, label: "Pulang Cepat" },
    };

    const config = statusConfig[status] || statusConfig.hadir;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getApprovalBadge = (approvalStatus) => {
    const config = {
      approved: { color: "bg-green-100 text-green-800", label: "Disetujui" },
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Menunggu" },
      rejected: { color: "bg-red-100 text-red-800", label: "Ditolak" },
    };

    const statusConfig = config[approvalStatus] || config.pending;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  const filteredPresences = useMemo(() => {
    return presences.filter((p) => {
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterDate && p.tanggal !== filterDate) return false;
      return true;
    });
  }, []);

  if (!activeInternship) {
    return (
      <StudentLayout>
        <div className="flex-1 p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Tidak Ada PKL Aktif
            </h3>
            <p className="text-yellow-700">
              Anda belum memiliki PKL yang aktif. Silakan hubungi admin untuk informasi lebih lanjut.
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Presensi PKL
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola presensi PKL Anda di {activeInternship?.company?.name || "Perusahaan"}
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="hadir">Hadir</option>
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin</option>
                  <option value="alpha">Alpha</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="pulang_cepat">Pulang Cepat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter Tanggal
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tambah Presensi
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Jam Masuk/Keluar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Approval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredPresences.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada presensi yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredPresences.map((presence) => (
                    <tr key={presence.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(presence.tanggal).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(presence.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {presence.jam_masuk ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {presence.jam_masuk}
                              {presence.jam_keluar && ` - ${presence.jam_keluar}`}
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getApprovalBadge(presence.approval_status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={presence.keterangan}>
                          {presence.keterangan || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(presence)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {presence.approval_status !== "approved" && (
                            <>
                              <button
                                onClick={() => handleOpenModal(presence)}
                                className="text-yellow-600 hover:text-yellow-800 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(presence)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedPresence ? "Edit Presensi" : "Tambah Presensi"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={submitLoading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal"
                      value={form.tanggal}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full border rounded-md px-3 py-2 text-sm ${
                        errors.tanggal ? "border-red-500" : "border-gray-300"
                      } focus:ring-blue-500 focus:border-blue-500`}
                      required
                    />
                    {errors.tanggal && (
                      <p className="text-red-600 text-xs mt-1">
                        {Array.isArray(errors.tanggal) ? errors.tanggal[0] : errors.tanggal}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className={`w-full border rounded-md px-3 py-2 text-sm ${
                        errors.status ? "border-red-500" : "border-gray-300"
                      } focus:ring-blue-500 focus:border-blue-500`}
                      required
                    >
                      <option value="hadir">Hadir</option>
                      <option value="sakit">Sakit</option>
                      <option value="izin">Izin</option>
                      <option value="alpha">Alpha</option>
                      <option value="terlambat">Terlambat</option>
                      <option value="pulang_cepat">Pulang Cepat</option>
                    </select>
                    {errors.status && (
                      <p className="text-red-600 text-xs mt-1">
                        {Array.isArray(errors.status) ? errors.status[0] : errors.status}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam Masuk
                    </label>
                    <input
                      type="time"
                      name="jam_masuk"
                      value={form.jam_masuk}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.jam_masuk && (
                      <p className="text-red-600 text-xs mt-1">
                        {Array.isArray(errors.jam_masuk) ? errors.jam_masuk[0] : errors.jam_masuk}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam Keluar
                    </label>
                    <input
                      type="time"
                      name="jam_keluar"
                      value={form.jam_keluar}
                      onChange={handleChange}
                      min={form.jam_masuk || undefined}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.jam_keluar && (
                      <p className="text-red-600 text-xs mt-1">
                        {Array.isArray(errors.jam_keluar) ? errors.jam_keluar[0] : errors.jam_keluar}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    value={form.keterangan}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Masukkan keterangan (opsional)"
                  />
                  {errors.keterangan && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.keterangan) ? errors.keterangan[0] : errors.keterangan}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Bukti (PDF, JPG, PNG - Max 2MB)
                  </label>
                  <input
                    type="file"
                    name="file_bukti"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.file_bukti && (
                    <p className="text-red-600 text-xs mt-1">
                      {Array.isArray(errors.file_bukti) ? errors.file_bukti[0] : errors.file_bukti}
                    </p>
                  )}
                  {form.file_bukti && (
                    <p className="text-sm text-gray-600 mt-1">
                      File: {form.file_bukti.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={submitLoading}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        {selectedPresence ? "Update Presensi" : "Tambah Presensi"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {isDetailModalOpen && selectedPresence && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Detail Presensi</h3>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <p className="text-gray-900">
                      {new Date(selectedPresence.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div>{getStatusBadge(selectedPresence.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
                    <p className="text-gray-900">{selectedPresence.jam_masuk || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar</label>
                    <p className="text-gray-900">{selectedPresence.jam_keluar || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                    <div>{getApprovalBadge(selectedPresence.approval_status)}</div>
                  </div>
                  {selectedPresence.approved_at && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disetujui Pada</label>
                      <p className="text-gray-900">
                        {new Date(selectedPresence.approved_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                </div>

                {selectedPresence.keterangan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedPresence.keterangan}</p>
                  </div>
                )}

                {selectedPresence.file_bukti && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Bukti</label>
                    <a
                      href={`http://127.0.0.1:8000/storage/${selectedPresence.file_bukti}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat File
                    </a>
                  </div>
                )}

                {selectedPresence.rejection_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penolakan</label>
                    <p className="text-red-600">{selectedPresence.rejection_reason}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal />
      </div>
    </StudentLayout>
  );
}

