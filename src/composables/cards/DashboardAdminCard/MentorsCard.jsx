import { Briefcase, Zap } from "lucide-react";
import { api } from "../../hooks/hooks";
import { useEffect, useState } from "react";

export default function  MentorsCard() {
    const axios = api();
    const [data, setData] = useState([]);

    useEffect(() => {

      axios.get('supervisors').then((res) => {
          setData(res.data.data)
      }).catch((err) => {
          console.log(err.response)
      });
    }, [])


    return(
         <div className="bg-white shadow rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-500" />
                <h3 className="text-gray-500 text-sm font-medium">
                  Pembimbing
                </h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mt-2">{data.length}</p>
            </div>
        
    )
}
