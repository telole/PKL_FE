    import { useState } from "react";
    import { api } from "../composables/hooks/hooks";
    import { useNavigate } from "react-router-dom";

    function Login() {
        const axios = api();
        const [data, setData] = useState({email: "", password   : ""});
        const [Alert, setAlert] = useState(null);
        const navigate = useNavigate();

        function HandleChange(e) {
            setData({...data, [e.target.name]: e.target.value})
        }
        function HandleSubmit(e) {
            e.preventDefault();

            axios.post('login', data).then((res) => {
                console.log("Login Success")

                localStorage.setItem('name', res.data.user.username);
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', res.data.user.role);
                // const    
                const token = localStorage.getItem('token');
                console.log(token)
                if(res.data.user.role === "teacher" || res.data.user.role === "admin" || res.data.user.role === "supervisor") {
                    navigate('/admin')
                }else{
                    navigate("/home")
                }
                

                // navigate('/dashboard')
            }).catch((err) => {
                console.log(err);
                setAlert(err.response.data.message || "error")
            });
        }

        return (
            <>
        <main class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div class="flex justify-center mb-6">
                    <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-center text-gray-900 mb-2">Sistem PKL</h2>
                <p class="text-center text-gray-600 text-sm mb-8">Teknologi Jaringan Komputer</p>

                <form class="space-y-6"
                onSubmit={HandleSubmit}>
                    <div>
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            onChange={HandleChange}
                            value={data.email}
                            type="text"
                            id="email"
                            name="email"
                            placeholder="Enter Correct Email"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                        />
                        {/* <p class="text-xs text-gray-500 mt-1">Masukkan "admin" untuk akses administrator</p> */}
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                        Password
                        </label>
                        <input
                            type="password"
                            onChange={HandleChange}
                            value={data.password}
                            id="password"
                            name="password"
                            placeholder="Enter Password"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <button
                        type="submit"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </main>

            </>

        )
    }


    export default Login;