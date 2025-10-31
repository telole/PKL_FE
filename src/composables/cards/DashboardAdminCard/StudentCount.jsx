import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { api } from "../../hooks/hooks";

function StudentCount() {
  const axios = api();
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("students")
      .then((res) => {
        setData(res.data.student);
        console.log(res.data.student);
      })
      .catch((err) => {
        console.log(err.response?.data);
      });
  }, []); 

  return (
    <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-blue-500" />
        <h3 className="text-gray-500 text-sm font-medium">Total Siswa</h3>
      </div>
      <p className="text-2xl font-bold text-gray-800 mt-2">{data.length}</p>
    </div>
  );
}

export default StudentCount;
