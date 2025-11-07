import { Link } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../hooks/UseApi";
import { useSetError } from "../../hooks/SetError";

export default function NetworkCard() {
  const [topCompanies, setTopCompanies] = useState([]);
  const axios = api();
  const { setError } = useSetError();

  useEffect(() => {
    axios
      .get("intern") 
      .then((res) => {
        const internships = res.data.data;

        const companyCount = {};
        internships.forEach((item) => {
          const companyName = item.company?.name;
          if (companyName) {
            companyCount[companyName] = (companyCount[companyName] || 0) + 1;
          }
        });

        const sorted = Object.entries(companyCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4);

        setTopCompanies(sorted);
      })
      .catch((err) => {
        setError(err, "Gagal memuat data perusahaan.");
      });
  }, []);

  return (
    <div className="bg-blue-50 rounded-lg p-4 shadow">
      <div className="flex items-center gap-2 mb-2">
        <Link className="w-4 h-4 text-blue-700" />
        <h4 className="font-medium text-blue-700">
          Top Perusahaan Magang (Terbanyak Siswa)
        </h4>
      </div>

      <ul className="text-sm text-gray-700 space-y-1">
        {topCompanies.length > 0 ? (
          topCompanies.map(([name, count]) => (
            <li key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="font-medium text-blue-700">{count} siswa</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic">Memuat data...</li>
        )}
      </ul>
    </div>
  );
}
