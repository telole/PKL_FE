import { BookOpen, Building, Settings, UserCheck, Users } from "lucide-react";

export default function DataManagement() {


    return (
         <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-blue-600" />
                Manajemen Data
              </h3>

              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Kelola Data Siswa
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-500" />
                  Dokumen & Arsip Siswa
                </li>
                <li className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-500" />
                  Pembimbing PKL
                </li>
                <li className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-green-600" />
                  Perusahaan Mitra
                </li>
              </ul>
            </div>

    )
}