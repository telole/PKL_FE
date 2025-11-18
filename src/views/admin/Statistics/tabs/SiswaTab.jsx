import { Users, BarChart3 } from "lucide-react";

export default function SiswaTab({ studentData }) {
  const total = studentData.active + studentData.completed + studentData.notStarted;
  const activePercent = total > 0 ? Math.round((studentData.active / total) * 100) : 0;
  const completedPercent = total > 0 ? Math.round((studentData.completed / total) * 100) : 0;
  const notStartedPercent = total > 0 ? Math.round((studentData.notStarted / total) * 100) : 0;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Siswa PKL */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="font-medium text-gray-700 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Status Siswa PKL
            </h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-around mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{studentData.active}</div>
                <div className="text-sm text-gray-500">Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{studentData.completed}</div>
                <div className="text-sm text-gray-500">Selesai</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{studentData.notStarted}</div>
                <div className="text-sm text-gray-500">Belum Mulai</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Aktif</span>
                <span>{activePercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${activePercent}%` }}></div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Selesai</span>
                <span>{completedPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${completedPercent}%` }}></div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Belum Mulai</span>
                <span>{notStartedPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${notStartedPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Rata-rata Progres */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="font-medium text-gray-700 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Rata-rata Progres PKL
            </h2>
          </div>
          <div className="p-4 h-64 relative">
            {studentData.monthlyProgress && studentData.monthlyProgress.length > 0 ? (
              <div className="absolute inset-0 flex items-end px-4 pb-4">
                {studentData.monthlyProgress.map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full max-w-[50px] bg-green-500 rounded-t"
                      style={{ height: `${Math.max(month.percentage, 10)}%` }}
                    ></div>
                    <span className="text-xs mt-1">{month.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                Tidak ada data progres
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Distribusi Kelas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="font-medium text-gray-700 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Distribusi Kelas
          </h2>
        </div>
        <div className="p-4">
          {studentData.classes && studentData.classes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {studentData.classes.map((cls) => (
                <div
                  key={cls.name}
                  className="border rounded p-3 text-center bg-gradient-to-r from-blue-50 to-indigo-50"
                >
                  <p className="text-sm font-medium text-blue-700">{cls.name}</p>
                  <p className="text-xs text-gray-600">{cls.count} siswa</p>
                  {cls.specialization && (
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {cls.specialization}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Tidak ada data kelas</p>
          )}
        </div>
      </div>
    </>
  );
}

