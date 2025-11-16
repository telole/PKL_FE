
import TeacherView from "../../Fragment/TeacherView";
import MainPanel from "../../composables/nav/MainPanel";
import Sidebar from "../../composables/nav/Sidebar";

export default function Teachermanagement() { 
    return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
        <MainPanel />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <TeacherView />
          </main>
      </div>
      </div>
    )
}