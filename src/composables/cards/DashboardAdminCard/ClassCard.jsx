import { useEffect, useState } from "react";
import { api } from "../../hooks/UseApi";
import { useSetError } from "../../hooks/SetError";

export default function ClassCard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const axios = api();
  const { setError } = useSetError();

  useEffect(() => {
    axios
      .get("students")
      .then((res) => {
        setStudents(res.data.student || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err, "Gagal memuat data kelas.");
        setLoading(false);
      });
  }, []); 

  if (loading) {
    return <p>Loading...</p>;
  }

  const classCount = students.reduce((acc, s) => {
    if (!s.KELAS) return acc;
    acc[s.KELAS] = (acc[s.KELAS] || 0) + 1;
    return acc;
  }, {});
  const classEntries = Object.entries(classCount); 

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {classEntries.map(([kelas, jumlah]) => (
        <div
          key={kelas}
          className="bg-indigo-50 rounded-lg p-3 text-center shadow-sm"
        >
          <h4 className="font-semibold text-indigo-700">{kelas}</h4>
          <p className="text-gray-600 text-sm">{jumlah} siswa</p>
        </div>
      ))}
    </div>
  );
}
