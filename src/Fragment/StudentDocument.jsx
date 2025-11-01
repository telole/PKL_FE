export default function Document() {



    return (
      <main class="flex-1 p-6">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <i data-lucide="folder-open" class="w-6 h-6 text-blue-600"></i>
            Manajemen Dokumen Siswa
          </h2>
          <p class="text-gray-500 text-sm mt-1">
            Kelola, verifikasi, dan pantau semua dokumen yang diunggah oleh siswa selama kegiatan PKL berlangsung.
          </p>
        </div>

    {/* <!-- Filter & Search --> */}
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div class="flex items-center gap-3 flex-1">
            {/* <!-- Search bar panjang --> */}
            <div class="relative flex-1">
                 <i data-lucide="search" class="absolute left-3 top-2.5 w-4 h-4 text-gray-400"></i>
                <input type="text" placeholder="Cari dokumen siswa..."
                    class="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full"/>
            </div>

            {/* <!-- Dropdown tipe dokumen --> */}
            <select class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[130px]">
                <option>Semua Tipe</option>
                <option>PDF</option>
                <option>DOCX</option>
                <option>XLSX</option>
            </select>

            {/* <!-- Dropdown status --> */}
            <select class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[150px]">
                <option>Semua Status</option>
                <option>Disetujui</option>
                <option>Menunggu</option>
                <option>Ditolak</option>
            </select>
        </div>

            {/* <!-- Tombol upload --> */}
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center gap-2 text-sm">
                <i data-lucide="upload-cloud" class="w-4 h-4"></i> Upload Dokumen
            </button>
    </div>


        {/* <!-- Tabel Dokumen --> */}
        <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Dokumen</th>
                <th class="py-3 px-4 text-left font-medium">Siswa</th>
                <th class="py-3 px-4 text-left font-medium">Tanggal Upload</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-center font-medium">Aksi</th>
              </tr>
            </thead>

            <tbody class="divide-y">
              {/* <!-- Row 1 --> */}
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 flex items-center gap-3">
                  <i data-lucide="file-text" class="w-6 h-6 text-blue-600"></i>
                  <div>
                    <p class="font-medium text-gray-900">Laporan PKL Angga.pdf</p>
                    <p class="text-xs text-gray-500">Laporan kegiatan mingguan selama PKL di CV. Teknokreatif.</p>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-800">Angga Prasetyo</p>
                  <p class="text-xs text-gray-500">XII TJKT 1</p>
                </td>
                <td class="px-4 py-3">12 September 2023</td>
                <td class="px-4 py-3 flex items-center gap-1 text-green-700">
                  <i data-lucide="check-circle" class="w-4 h-4"></i>
                  <span class="text-xs font-medium">Disetujui</span>
                </td>
                {/* <!-- Aksi: pastikan berada di kolom terakhir dan terpusat --> */}
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-3">
                    <button title="Lihat" class="text-blue-500 hover:text-blue-700">
                      <i data-lucide="eye" class="w-5 h-5"></i>
                    </button>
                    <button title="Download" class="text-green-500 hover:text-green-700">
                      <i data-lucide="download" class="w-5 h-5"></i>
                    </button>
                    <button title="Hapus" class="text-red-500 hover:text-red-700">
                      <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    )
}