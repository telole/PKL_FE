import { Laptop } from "lucide-react";

export default function ProgramCard() {


    return (
        <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Laptop className="w-4 h-4 text-purple-700" />
                    <h4 className="font-medium text-purple-700">Pemrograman</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>Laravel</li>
                    <li>Vue</li>
                    <li>Reacts</li>
                  </ul>
                </div>
    )
}