import { useState } from "react";
import { Calendar, Filter, CheckCircle, Clock, CalendarDays, User } from "lucide-react";
import StudentLayout from "../../composables/layouts/StudentLayout";

const activities = [
  {
    id: 1,
    title: "Orientasi Perusahaan",
    description: "Pengenalan lingkungan kerja dan budaya perusahaan",
    date: "10 Juni 2023",
    status: "completed",
    mentor: "Budi Santoso",
    notes: "Siswa telah menyelesaikan orientasi dengan baik",
  },
  {
    id: 2,
    title: "Pelatihan Sistem Informasi",
    description: "Pelatihan penggunaan sistem informasi perusahaan",
    date: "15 Juni 2023",
    status: "completed",
    mentor: "Budi Santoso",
    notes: "Pemahaman sistem sudah cukup baik, perlu latihan lebih lanjut",
  },
  {
    id: 3,
    title: "Praktek Jaringan LAN",
    description: "Instalasi dan konfigurasi jaringan lokal",
    date: "20 Juni 2023",
    status: "in_progress",
    mentor: "Siti Nurhaliza",
    notes: "Sedang dalam proses pembelajaran konfigurasi switch dan router",
  },
  {
    id: 4,
    title: "Proyek Akhir PKL",
    description: "Pengerjaan proyek akhir sebagai tugas akhir PKL",
    date: "25 Juli 2023",
    status: "upcoming",
    mentor: "Budi Santoso",
    notes: "Persiapan proyek akan dimulai minggu depan",
  },
];

export default function ActivityStudent() {
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredActivities = activities.filter((activity) => {
    const matchesStatus = statusFilter === "" || activity.status === statusFilter;
    const matchesDate = dateFilter === "" || activity.date.includes(dateFilter);
    return matchesStatus && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Selesai
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Sedang Berlangsung
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <CalendarDays className="w-3 h-3 mr-1" />
            Akan Datang
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <StudentLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Kegiatan PKL</h1>
          <p className="text-gray-600 mt-1">Daftar kegiatan selama praktek kerja lapangan</p>
        </div>

        {/* Filter Row */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Filter Status */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="in_progress">Sedang Berlangsung</option>
              <option value="upcoming">Akan Datang</option>
            </select>
          </div>

          {/* Filter Tanggal */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* LIST AKTIVITAS */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Tidak ada kegiatan yang ditemukan</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <li key={activity.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1 flex-wrap gap-2">
                        {getStatusBadge(activity.status)}
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {activity.date}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mt-2">{activity.title}</h3>

                      <p className="mt-1 text-sm text-gray-600">{activity.description}</p>

                      <p className="mt-2 text-sm text-gray-500 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Pembimbing: {activity.mentor}
                      </p>
                    </div>

                    <button className="ml-4 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                      Detail
                    </button>
                  </div>

                  {/* Catatan */}
                  {activity.notes && (
                    <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      <p className="font-medium text-gray-900 mb-1">Catatan:</p>
                      <p>{activity.notes}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
