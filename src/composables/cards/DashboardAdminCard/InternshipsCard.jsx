import { Zap } from "lucide-react";
import { api } from "../../hooks/UseApi";
import { useEffect, useState } from "react";

export default function InternShips() {
    const axios = api();
    const [data, setData] = useState([]);



    useEffect(() => {
      axios.get('intern').then((res) => {
          setData(res.data.data)
      }).catch((err) => {
          console.log(err.response?.json)
      });
    }, [])

    return (
         <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                <h3 className="text-gray-500 text-sm font-medium">PKL Aktif</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{data.length}</p>
            </div>

    )
}