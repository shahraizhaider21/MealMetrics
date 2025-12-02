import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Utensils, LayoutDashboard, CalendarDays, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const auth = useContext(AuthContext);
    const location = useLocation();
    const user = auth?.user;

    const logout = () => {
        auth?.logout();
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-white/40 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <Utensils className="text-slate-700" size={20} />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">
                        Meal<span className="text-slate-500">Metrics</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <NavLink to="/" icon={<LayoutDashboard size={18} />} text="Dashboard" active={location.pathname === '/'} />
                    <NavLink to="/planner" icon={<CalendarDays size={18} />} text="Planner" active={location.pathname === '/planner'} />
                    <NavLink to="/shopping-list" icon={<Utensils size={18} />} text="Shopping List" active={location.pathname === '/shopping-list'} />
                    <NavLink to="/analysis" icon={<PieChart size={18} />} text="Analysis" active={location.pathname === '/analysis'} />
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
                                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                                    <span className="text-xs font-bold">{user.username.charAt(0).toUpperCase()}</span>
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                    {user.username}
                                </span>
                            </div>

                            <button
                                onClick={logout}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, text, active }: { to: string; icon: React.ReactNode; text: string; active: boolean }) => (
    <Link
        to={to}
        className="relative flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2"
    >
        {active && (
            <motion.div
                layoutId="navbar-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className={`relative z-10 flex items-center gap-2 ${active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>
            {icon}
            <span>{text}</span>
        </span>
    </Link>
);

export default Navbar;
