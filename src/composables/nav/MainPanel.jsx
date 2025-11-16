export default function MainPanel() {
    const username = localStorage.getItem("name");

    return (
        // <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7h18M3 12h18m-9 5h9"
              />
            </svg>

            <h1 className="text-lg font-semibold">
              Sistem PKL - <span className="font-normal">Panel Admin</span>
            </h1>
          </div>

          <span className="text-sm">
            Selamat datang, <b>Administrator {username}</b>
          </span>
        </div>
      </header>
    )
}