import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Utensils, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        auth?.logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-green-600 flex items-center gap-2">
                        <Utensils className="w-6 h-6" />
                        MealMetrics
                    </Link>

                    <div className="flex items-center gap-4">
                        {auth?.user ? (
                            <>
                                <Link to="/" className="text-gray-600 hover:text-green-600 flex items-center gap-1">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <Link to="/planner" className="text-gray-600 hover:text-green-600 flex items-center gap-1">
                                    <Utensils className="w-4 h-4" />
                                    Planner
                                </Link>
                                <Link to="/shopping-list" className="text-gray-600 hover:text-green-600 flex items-center gap-1">
                                    <Utensils className="w-4 h-4" />
                                    Shopping List
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 text-red-500 hover:text-red-700"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-green-600">Login</Link>
                                <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
