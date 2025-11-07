import { AlertCircle } from "lucide-react";
import { api } from "../../hooks/UseApi";
import { useEffect, useState } from "react";
import { useSetError } from "../../hooks/SetError";

export default function Document() {
    const axios = api();
    const [data, setData] = useState([]);
    const { setError } = useSetError();

    useEffect(() => {
      axios.get('reportsa').then((res) => {
          setData(res.data.data)
      }).catch((err) => {
          setError(err, "Gagal memuat data dokumen.");
      });
    }, [])
    return(
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h3 className="text-gray-500 text-sm font-medium">
                  Dokumen Tertunda
                </h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{data.length}</p>
            </div>
    )
}