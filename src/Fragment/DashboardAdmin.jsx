
import Sidebar from "../composables/nav/Sidebar";
import StudentCount from "../composables/cards/DashboardAdminCard/StudentCount";
import MentorsCard from "../composables/cards/DashboardAdminCard/MentorsCard";
import InternShips from "../composables/cards/DashboardAdminCard/InternshipsCard";
import Document from "../composables/cards/DashboardAdminCard/Document";
import DataManagement from "../composables/cards/DashboardAdminCard/DataManagement";
import NetworkCard from "../composables/cards/DashboardAdminCard/NetworkCard";
import ProgramCard from "../composables/cards/DashboardAdminCard/ProgramCard";
import ClassCard from "../composables/cards/DashboardAdminCard/ClassCard";
import MainPanel from "../composables/nav/MainPanel";
import { Globe2 } from "lucide-react";

export default function DashboardAdmin() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MainPanel/>

      <div className="flex flex-1">
        <Sidebar/>

        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Dashboard Administrator
          </h2>
          <p className="text-gray-600 mb-6">
            Pantau dan kelola seluruh aktivitas PKL secara terpusat dan efisien
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StudentCount/>
            <InternShips/>
            <MentorsCard/>
            <Document/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
           <DataManagement/>

            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Globe2 className="w-5 h-5 text-green-600" />
                Distribusi PKL & Kelas
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <NetworkCard/>

                <ProgramCard/>
              </div>

              <ClassCard/>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
