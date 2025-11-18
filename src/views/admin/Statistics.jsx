import { useState, useEffect, useMemo, useRef } from "react";
import { BarChart2, Download, Loader2 } from "lucide-react";
import MainPanel from "../../composables/nav/MainPanel";
import Sidebar from "../../composables/nav/Sidebar";
import { api } from "../../composables/hooks/UseApi";
import { useSetError } from "../../composables/hooks/SetError";
import { useSetLoading } from "../../composables/hooks/setLoading";
import RingkasanTab from "./Statistics/tabs/RingkasanTab";
import SiswaTab from "./Statistics/tabs/SiswaTab";
import LaporanTab from "./Statistics/tabs/LaporanTab";
import LokasiTab from "./Statistics/tabs/LokasiTab";
import {
  calculateStudentStats,
  calculateReportStats,
  calculateLocationStats,
  calculateMonthlyProgress,
  getMonthAbbr,
} from "./Statistics/utils/statisticsUtils";

export default function Statistics() {
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [timeFilter, setTimeFilter] = useState("Bulan Ini");
  const [locationFilter, setLocationFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const axios = useMemo(() => api(), []);
  const { setError } = useSetError();
  const [loading, setLoading] = useSetLoading(true);
  const statusChartRef = useRef(null);
  const statusChartInstance = useRef(null);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const studentStats = useMemo(() => calculateStudentStats(students), [students]);
  const reportStats = useMemo(() => calculateReportStats(reports), [reports]);
  
  // Memoize location stats dengan dependency yang lebih stabil
  const locationStats = useMemo(() => {
    if (companies.length === 0 && students.length === 0) return [];
    return calculateLocationStats(companies, students);
  }, [companies, students]);

  // Monthly report trend for ringkasan tab
  const monthlyReportTrend = useMemo(() => {
    if (!reports || reports.length === 0) return [];
    
    const monthlyCount = {};
    reports.forEach((report) => {
      const month = getMonthAbbr(report.created_at);
      if (month && month !== "Unknown") {
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    return months
      .filter((m) => monthlyCount[m])
      .map((month) => ({
        month,
        count: monthlyCount[month] || 0,
      }))
      .slice(-6); // Last 6 months
  }, [reports]);

  // Summary data
  const summaryData = useMemo(() => {
    return {
      totalStudents: studentStats.total,
      activeStudents: studentStats.active,
      completedStudents: studentStats.completed,
      totalReports: reportStats.total,
      approvedReports: reportStats.approved,
      pendingReports: reportStats.pending + reportStats.sent,
      rejectedReports: reportStats.rejected,
      totalLocations: companies.length,
      totalTeachers: teachers.length,
      specializations: studentStats.specializations,
    };
  }, [studentStats, reportStats, companies.length, teachers.length]);

  // Student data for tab
  const studentData = useMemo(() => {
    const internships = students
      .map((s) => s.internshps?.[0] || s.internship)
      .filter(Boolean);

    return {
      active: studentStats.active,
      completed: studentStats.completed,
      notStarted: studentStats.notStarted,
      classes: studentStats.classes,
      monthlyProgress: calculateMonthlyProgress(internships),
    };
  }, [studentStats, students]);

  // Report data for tab
  const reportData = useMemo(() => {
    return {
      approved: reportStats.approved,
      pending: reportStats.pending + reportStats.sent,
      rejected: reportStats.rejected,
      monthly: reportStats.monthly,
      reports: reportStats.reports,
    };
  }, [reportStats]);

  // Location data for tab
  const locationData = useMemo(() => locationStats, [locationStats]);

  // Fetch data from API (only once on mount)
  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsRes = await axios.get("students");
        const studentsData = studentsRes.data.student || studentsRes.data.data || [];
        if (!cancelled) setStudents(Array.isArray(studentsData) ? studentsData : []);
        
        const reportsRes = await axios.get("reportsa");
        const reportsData = reportsRes.data.data || [];
        if (!cancelled) setReports(Array.isArray(reportsData) ? reportsData : []);

        const companiesRes = await axios.get("companie");
        const companiesData = companiesRes.data.data || [];
        if (!cancelled) setCompanies(Array.isArray(companiesData) ? companiesData : []);

        try {
          const teachersRes = await axios.get("teachers");
          const teachersData = teachersRes.data.Data || teachersRes.data.data || [];
          if (!cancelled) setTeachers(Array.isArray(teachersData) ? teachersData : []);
        } catch (err) {
          console.warn("Failed to fetch teachers:", err);
          if (!cancelled) setTeachers([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err, "Gagal memuat data statistik.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add CSS for progress bar animation (only once on mount)
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "statistics-progress-style";
    
    // Check if style already exists
    if (document.getElementById("statistics-progress-style")) {
      return;
    }
    
    style.textContent = `
      .progress-bar {
        width: 0;
        height: 100%;
        border-radius: 0.25rem;
        transition: width 1s ease-in-out;
        position: relative;
      }
      .progress-container:hover .tooltip {
        opacity: 1;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        transition: all 0.3s ease;
      }
      tbody tr:nth-child(odd) {
        background-color: #f9fafb;
      }
      tbody tr:hover {
        background-color: #e0f2fe;
        transform: translateX(2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
    `;
    document.head.appendChild(style);

    // Animate progress bars when tab changes
    const animateProgress = () => {
      document.querySelectorAll(".progress-bar[data-width]").forEach((bar) => {
        const width = bar.getAttribute("data-width");
        setTimeout(() => {
          bar.style.width = width + "%";
        }, 50);
      });
    };

    setTimeout(animateProgress, 100);

    return () => {
      const existingStyle = document.getElementById("statistics-progress-style");
      if (existingStyle && document.head.contains(existingStyle)) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "laporan" || !statusChartRef.current) return;

    const initChart = () => {
      if (typeof window !== "undefined" && window.Chart) {
        if (statusChartInstance.current) {
          statusChartInstance.current.destroy();
        }

        const monthlyData = reportData.monthly || {};
        const months = Object.keys(monthlyData).length > 0 ? Object.keys(monthlyData) : ["Jun", "Jul", "Ags", "Sep"];

        const ctx = statusChartRef.current.getContext("2d");
        statusChartInstance.current = new window.Chart(ctx, {
          type: "bar",
          data: {
            labels: months,
            datasets: [
              {
                label: "Disetujui",
                data: months.map((m) => monthlyData[m]?.Disetujui || 0),
                backgroundColor: "rgba(34,197,94,0.7)",
              },
              {
                label: "Tertunda",
                data: months.map((m) => monthlyData[m]?.Tertunda || 0),
                backgroundColor: "rgba(234,179,8,0.7)",
              },
              {
                label: "Ditolak",
                data: months.map((m) => monthlyData[m]?.Ditolak || 0),
                backgroundColor: "rgba(239,68,68,0.7)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" } },
            scales: { y: { beginAtZero: true } },
          },
        });
      } else {
        setTimeout(initChart, 100);
      }
    };
    initChart();

    return () => {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
        statusChartInstance.current = null;
      }
    };
  }, [activeTab, reportData.monthly]);

  // Load Chart.js if not available (only once)
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Chart && activeTab === "laporan") {
      // Check if script already exists
      if (document.querySelector('script[src*="chart.js"]')) {
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, [activeTab]);

  // Update chart when month filter changes
  useEffect(() => {
    if (activeTab !== "laporan" || !statusChartInstance.current || !reportData.monthly) return;

    const monthlyData = reportData.monthly || {};
    const months = Object.keys(monthlyData);

    if (monthFilter === "all") {
      statusChartInstance.current.data.labels = months.length > 0 ? months : ["Jun", "Jul", "Ags", "Sep"];
      statusChartInstance.current.data.datasets[0].data = statusChartInstance.current.data.labels.map(
        (m) => monthlyData[m]?.Disetujui || 0
      );
      statusChartInstance.current.data.datasets[1].data = statusChartInstance.current.data.labels.map(
        (m) => monthlyData[m]?.Tertunda || 0
      );
      statusChartInstance.current.data.datasets[2].data = statusChartInstance.current.data.labels.map(
        (m) => monthlyData[m]?.Ditolak || 0
      );
    } else {
      statusChartInstance.current.data.labels = [monthFilter];
      statusChartInstance.current.data.datasets[0].data = [monthlyData[monthFilter]?.Disetujui || 0];
      statusChartInstance.current.data.datasets[1].data = [monthlyData[monthFilter]?.Tertunda || 0];
      statusChartInstance.current.data.datasets[2].data = [monthlyData[monthFilter]?.Ditolak || 0];
    }
    statusChartInstance.current.update();
  }, [monthFilter, activeTab, reportData.monthly]);

  const handleDownload = () => {
    let csv = "";
    let filename = "";

    if (activeTab === "ringkasan") {
      csv = "Metrik,Nilai\n";
      csv += `Total Siswa PKL,${summaryData.totalStudents}\n`;
      csv += `Total Laporan,${summaryData.totalReports}\n`;
      csv += `Lokasi & Pembimbing,${summaryData.totalLocations}\n`;
      filename = "ringkasan_statistik.csv";
    } else if (activeTab === "siswa") {
      csv = "Status,Jumlah\n";
      csv += `Aktif,${studentData.active}\n`;
      csv += `Selesai,${studentData.completed}\n`;
      csv += `Belum Mulai,${studentData.notStarted}\n`;
      filename = "statistik_siswa.csv";
    } else if (activeTab === "laporan") {
      csv = "ID,Nama Siswa,Status,Tanggal\n";
      filteredReports.forEach((r) => {
        const studentName = r.internship?.students?.users?.full_name || r.name || "Tidak diketahui";
        csv += `${r.id},${studentName},${r.status},${r.date || r.created_at}\n`;
      });
      filename = "laporan.csv";
    } else if (activeTab === "lokasi") {
      csv = "Kota,Jumlah Lokasi,Jumlah Siswa,Presentase Siswa\n";
      const filtered = locationFilter === "all" ? locationData : locationData.filter((d) => d.kota === locationFilter);
      const totalSiswa = filtered.reduce((sum, d) => sum + d.siswa.reduce((a, b) => a + b, 0), 0);
      filtered.forEach((d) => {
        const lokasiTotal = d.lokasi.length;
        const siswaTotal = d.siswa.reduce((a, b) => a + b, 0);
        const presentase = totalSiswa > 0 ? Math.round((siswaTotal / totalSiswa) * 100) + "%" : "0%";
        csv += `${d.kota},${lokasiTotal},${siswaTotal},${presentase}\n`;
      });
      filename = "ringkasan_kota.csv";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredReports = useMemo(() => {
    if (monthFilter === "all") return reportData.reports || [];
    return (reportData.reports || []).filter((r) => {
      const month = getMonthAbbr(r.created_at || r.date);
      return month === monthFilter;
    });
  }, [monthFilter, reportData.reports]);

  const filteredLocations = useMemo(() => {
    if (locationFilter === "all") return locationData;
    return locationData.filter((d) => d.kota === locationFilter);
  }, [locationFilter, locationData]);

  // Get unique months from reports for filter
  const availableMonths = useMemo(() => {
    const months = new Set();
    reportData.reports?.forEach((r) => {
      const month = getMonthAbbr(r.created_at || r.date);
      if (month && month !== "Unknown") {
        months.add(month);
      }
    });
    return Array.from(months).sort();
  }, [reportData.reports]);

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "siswa", label: "Siswa" },
    { id: "laporan", label: "Laporan" },
    { id: "lokasi", label: "Lokasi" },
  ];

  const tabDescriptions = {
    ringkasan: "Analisis dan visualisasi data program praktek kerja lapangan",
    siswa: "Status dan progres siswa dalam program praktek kerja lapangan",
    laporan: "Status dan progres laporan siswa dalam program PKL",
    lokasi: "Distribusi lokasi dan kapasitas siswa per kota",
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <MainPanel />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-blue-600" />
              Statistik PKL
            </h2>
            <p className="text-gray-600 mt-1">{tabDescriptions[activeTab]}</p>
          </div>

          {/* Tabs & Filters */}
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "laporan" && (
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="block rounded-md border border-gray-300 py-1 px-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Bulan</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              )}
              {activeTab === "lokasi" && (
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="block rounded-md border border-gray-300 py-1 px-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Semua Kota</option>
                  {locationData.map((loc) => (
                    <option key={loc.kota} value={loc.kota}>
                      {loc.kota}
                    </option>
                  ))}
                </select>
              )}
              {(activeTab === "ringkasan" || activeTab === "siswa") && (
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="block rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Bulan Ini</option>
                  <option>Minggu Ini</option>
                  <option>3 Bulan Terakhir</option>
                  <option>Tahun Ini</option>
                </select>
              )}
              <button
                onClick={handleDownload}
                className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
              >
                <Download className="w-5 h-5" />
                Unduh
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Memuat data statistik...</p>
            </div>
          ) : (
            <>
              {/* Tab Content */}
              {activeTab === "ringkasan" && (
                <RingkasanTab summaryData={summaryData} monthlyReportTrend={monthlyReportTrend} />
              )}
              {activeTab === "siswa" && <SiswaTab studentData={studentData} />}
              {activeTab === "laporan" && (
                <LaporanTab
                  reportData={reportData}
                  filteredReports={filteredReports}
                  statusChartRef={statusChartRef}
                />
              )}
              {activeTab === "lokasi" && (
                <LokasiTab filteredLocations={filteredLocations} locationData={locationData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
