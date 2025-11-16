import StudentSidebar from "../nav/StudentSidebar";

export default function StudentLayout({ children }) {
  const userName = localStorage.getItem("name") || "Siswa";

  return (
    <div className="bg-gray-50 min-h-screen flex font-sans">
      <StudentSidebar />
      <main className="flex-1 flex flex-col">
        <header className="flex justify-end items-center px-6 py-4 bg-white border-b border-gray-200">
          <span className="text-gray-700 text-sm">
            Selamat datang, <strong>{userName}</strong>
          </span>
        </header>
        {children}
      </main>
    </div>
  );
}

