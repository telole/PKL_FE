import { useEffect, useState, useMemo, useRef } from "react";
import { Clock, CheckCircle, AlertCircle, Award, Loader2 } from "lucide-react";
import StudentLayout from "../../composables/layouts/StudentLayout";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";

export default function Progress() {
  const [internship, setInternship] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useSetLoading(true);
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();
  
  const weeklyChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const weeklyChartInstance = useRef(null);
  const statusChartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch internship data
        const internshipResponse = await axios.get("intern/student");
        const internshipData = internshipResponse.data.data;
        if (internshipData && internshipData.length > 0) {
          setInternship(internshipData[0]);
        }

        // Fetch reports data
        const reportsResponse = await axios.get("reports");
        setReports(reportsResponse.data.data || []);
      } catch (err) {
        setError(err, "Gagal memuat data progres PKL.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!internship) {
      return {
        totalDays: 0,
        daysCompleted: 0,
        daysRemaining: 0,
        approvalRate: 0,
      };
    }

    const startDate = new Date(internship.start_date);
    const endDate = new Date(internship.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysCompleted = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, totalDays - daysCompleted);

    // Calculate approval rate from reports
    const totalReports = reports.length;
    const approvedReports = reports.filter((r) => r.status?.toLowerCase() === "disetujui").length;
    const approvalRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0;

    return {
      totalDays,
      daysCompleted,
      daysRemaining,
      approvalRate,
    };
  }, [internship, reports]);

  // Group reports by week for weekly activity chart
  const weeklyData = useMemo(() => {
    if (!internship || reports.length === 0) {
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        reportData: [0, 0, 0, 0],
      };
    }

    const startDate = new Date(internship.start_date);
    const reportCounts = [0, 0, 0, 0];

    reports.forEach((report) => {
      if (report.created_at) {
        const reportDate = new Date(report.created_at);
        const daysDiff = Math.floor((reportDate - startDate) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(daysDiff / 7);
        
        if (weekIndex >= 0 && weekIndex < 4) {
          reportCounts[weekIndex]++;
        }
      }
    });

    return {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      reportData: reportCounts,
    };
  }, [internship, reports]);

  // Calculate status distribution for pie chart
  const statusData = useMemo(() => {
    const statusCounts = {
      disetujui: 0,
      terkirim: 0,
      ditolak: 0,
      direvisi: 0,
    };

    reports.forEach((report) => {
      const status = report.status?.toLowerCase() || "terkirim";
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        statusCounts.terkirim++;
      }
    });

    return {
      labels: ["Disetujui", "Terkirim", "Ditolak", "Direvisi"],
      data: [
        statusCounts.disetujui,
        statusCounts.terkirim,
        statusCounts.ditolak,
        statusCounts.direvisi,
      ],
    };
  }, [reports]);

  useEffect(() => {
    if (loading || !weeklyChartRef.current || !statusChartRef.current) return;

    if (typeof window !== "undefined" && window.Chart) {
      if (weeklyChartInstance.current) {
        weeklyChartInstance.current.destroy();
      }
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }

      const weeklyCtx = weeklyChartRef.current.getContext("2d");
      weeklyChartInstance.current = new window.Chart(weeklyCtx, {
        type: "bar",
        data: {
          labels: weeklyData.labels,
          datasets: [
            {
              label: "Laporan",
              data: weeklyData.reportData,
              backgroundColor: "#60a5fa",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });

      const statusCtx = statusChartRef.current.getContext("2d");
      statusChartInstance.current = new window.Chart(statusCtx, {
        type: "pie",
        data: {
          labels: statusData.labels,
          datasets: [
            {
              data: statusData.data,
              backgroundColor: ["#4ade80", "#60a5fa", "#f87171", "#fbbf24"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = () => {
        setTimeout(() => {
          if (window.Chart && weeklyChartRef.current && statusChartRef.current) {
            const weeklyCtx = weeklyChartRef.current.getContext("2d");
            weeklyChartInstance.current = new window.Chart(weeklyCtx, {
              type: "bar",
              data: {
                labels: weeklyData.labels,
                datasets: [
                  {
                    label: "Laporan",
                    data: weeklyData.reportData,
                    backgroundColor: "#60a5fa",
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              },
            });

            const statusCtx = statusChartRef.current.getContext("2d");
            statusChartInstance.current = new window.Chart(statusCtx, {
              type: "pie",
              data: {
                labels: statusData.labels,
                datasets: [
                  {
                    data: statusData.data,
                    backgroundColor: ["#4ade80", "#60a5fa", "#f87171", "#fbbf24"],
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              },
            });
          }
        }, 100);
      };
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (weeklyChartInstance.current) {
        weeklyChartInstance.current.destroy();
      }
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
    };
  }, [loading, weeklyData, statusData]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <StudentLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Progres PKL</h1>
        <p className="text-gray-600 mb-6">Pantau perkembangan dan pencapaian selama PKL</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Memuat data progres...</p>
          </div>
        ) : !internship ? (
          <div className="bg-white p-12 rounded-lg border text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg mb-2">Belum ada data PKL</p>
            <p className="text-gray-500 text-sm">Anda belum memiliki data PKL yang aktif.</p>
          </div>
        ) : (
          <>
            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 w-full">
              <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Clock className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Hari</p>
                  <p className="text-xl font-bold">{statistics.totalDays} Hari</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hari Selesai</p>
                  <p className="text-xl font-bold">{statistics.daysCompleted} Hari</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertCircle className="text-yellow-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hari Tersisa</p>
                  <p className="text-xl font-bold">{statistics.daysRemaining} Hari</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Award className="text-purple-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tingkat Persetujuan</p>
                  <p className="text-xl font-bold">{statistics.approvalRate}%</p>
                </div>
              </div>
            </div>

            {/* Grafik */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Aktivitas Mingguan</h2>
                <div className="h-80">
                  <canvas ref={weeklyChartRef}></canvas>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Status Laporan</h2>
                <div className="h-80">
                  <canvas ref={statusChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Informasi PKL */}
            {internship && (
              <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">Informasi PKL</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Judul PKL</p>
                    <p className="font-medium text-gray-800">{internship.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Perusahaan</p>
                    <p className="font-medium text-gray-800">{internship.company?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Mulai</p>
                    <p className="font-medium text-gray-800">{formatDate(internship.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Selesai</p>
                    <p className="font-medium text-gray-800">{formatDate(internship.end_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pembimbing Sekolah</p>
                    <p className="font-medium text-gray-800">
                      {internship.teacher?.user_id ? `ID: ${internship.teacher.user_id}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Supervisor Perusahaan</p>
                    <p className="font-medium text-gray-800">
                      {internship.supervisor?.user_id ? `ID: ${internship.supervisor.user_id}` : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Skill Development - Static for now */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">Pengembangan Keterampilan</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>HTML/CSS</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>JavaScript</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>React</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>UI/UX Design</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>Teamwork</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Komentar Pembimbing */}
            {internship.notes && (
              <div className="bg-white p-6 rounded-xl shadow mb-10">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold mb-4">Komentar Pembimbing</h2>
                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="text-gray-800 text-sm">{internship.notes}</p>
                    <span className="text-xs text-gray-500">
                      {formatDate(internship.updated_at)} - Pembimbing
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
