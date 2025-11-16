import { useEffect, useState, useMemo } from "react";
import { Upload, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../../composables/layouts/StudentLayout";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";

export default function CreateReports() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    internship_id: "", // akan terisi otomatis
    title: "",
    content: "",
    file: null,
  });

  const [activeInternship, setActiveInternship] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loading, setLoading] = useSetLoading(true);
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();

  // -------------------------------
  //  AUTO AMBIL INTERNSHIP USER
  // -------------------------------
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const response = await axios.get("intern");
        const allInternships = response.data.data || [];

        const active = allInternships.find(
          (i) => i.status === "approved" || i.status === "in_progress"
        );

        if (active) {
          setActiveInternship(active);
          setFormData((prev) => ({ ...prev, internship_id: active.id }));
        } else {
          setActiveInternship(null);
        }
      } catch (err) {
        setError(err, "Gagal memuat data PKL.");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // -------------------------------
  //  INPUT HANDLER
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
      setFormData((prev) => ({
        ...prev,
        file,
      }));

      if (errors.file) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  // -------------------------------
  //  VALIDASI (tanpa internship_id)
  // -------------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul laporan wajib diisi.";
    }

    if (formData.file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "Format file tidak valid. Hanya pdf, doc, docx, txt.";
      }

      if (formData.file.size > 5 * 1024 * 1024) {
        newErrors.file = "Ukuran file maksimal 5MB.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------------
  //  SUBMIT
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!formData.internship_id) {
      setErrors({ internship_id: "PKL tidak ditemukan. Hubungi admin." });
      return;
    }

    try {
      setSubmitLoading(true);

      const submitData = new FormData();
      submitData.append("internship_id", formData.internship_id); // masih dikirim kalau backend butuh
      submitData.append("title", formData.title.trim());
      if (formData.content.trim()) submitData.append("content", formData.content.trim());
      if (formData.file) submitData.append("file", formData.file);
      submitData.append("status", "terkirim"); // sesuai backend kamu

      await axios.post("reports", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/home/reports", {
        state: { message: "Laporan berhasil diunggah" },
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors || {};
        const formattedErrors = {};
        Object.keys(validationErrors).forEach((key) => {
          formattedErrors[key] = Array.isArray(validationErrors[key])
            ? validationErrors[key][0]
            : validationErrors[key];
        });
        setErrors(formattedErrors);
      } else {
        setError(err, "Gagal mengunggah laporan. Silakan coba lagi.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/home/reports")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Laporan</span>
          </button>

          <div className="bg-white p-8 rounded-xl shadow">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">
              Buat Laporan Harian
            </h1>

            {/* ERROR GLOBAL */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {Object.values(errors).map((error, index) => (
                      <p key={index} className="text-sm">{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOADING PKL */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            ) : !activeInternship ? (
              <p className="text-red-600 text-center py-6">
                Tidak ada PKL aktif. Hubungi admin.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* INFO PKL OTOMATIS */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p>
                    <strong>PKL:</strong>{" "}
                    {activeInternship.company?.name || "Perusahaan"} (
                    {activeInternship.start_date} – {activeInternship.end_date})
                  </p>
                </div>

                {/* TITLE */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Judul Laporan <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    maxLength={255}
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Contoh: Implementasi UI Dashboard"
                    className={`w-full border rounded-lg p-2 ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>

                {/* CONTENT */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Isi Laporan
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={6}
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Tuliskan detail kegiatan hari ini..."
                    className={`w-full border rounded-lg p-2 ${
                      errors.content ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>

                {/* FILE */}
                <div>
                  <label className="block font-medium mb-1 text-gray-700">
                    Lampiran (Opsional)
                  </label>
                  <input
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className={`w-full border rounded-lg p-2 ${
                      errors.file ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Unggah Laporan
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
