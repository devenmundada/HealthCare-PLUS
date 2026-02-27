import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '../shared/Logo';
import { Button } from '../ui/Button';
import {
    Menu,
    X,
    MessageSquare,
    Image,
    Home,
    Users,
    UserCircle,
    Moon,
    Sun,
    Bell,
    BellRing,
    Info,
    AlertTriangle,
    Map,
    LayoutGrid,
    LogOut,
    User,
    Calendar,
    Heart,
    Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Navigation items configuration
const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Features', href: '/features', icon: Settings },
    { name: 'Command Center', href: '/dashboard', icon: LayoutGrid },
    { name: 'Doctors', href: '/doctors', icon: Users },
    { name: 'Map Prediction', href: '/map-prediction', icon: Map },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Emergency', href: 'tel:911', icon: AlertTriangle, isExternal: true },
    
];

export const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [emergencyAlerts, _setEmergencyAlerts] = useState(0);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Auth handlers
    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const handleLogin = () => {
        navigate('/login');
        setIsMenuOpen(false);
    };

    const handleSignup = () => {
        navigate('/signup');
        setIsMenuOpen(false);
    };

    // Handle emergency call with confirmation
    const handleEmergencyCall = () => {
        const confirmCall = window.confirm(
            'This will call emergency services (911). Use only for real medical emergencies. Proceed?'
        );
        if (confirmCall) {
            window.location.href = 'tel:911';
        }
        setIsMenuOpen(false);
    };

    // NavLink active className helper
    const getNavLinkClassName = (isActive: boolean, isMobile = false) => {
        const base = isMobile
            ? 'flex items-center px-3 py-2 rounded-lg text-base font-medium'
            : 'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors';

        return isActive
            ? `${base} bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300`
            : `${base} text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800`;
    };

    return (
        <nav className="sticky top-0 z-50 glass-panel border-b border-white/10">
            <div className="container-wide">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <NavLink to="/" className="flex items-center">
                            <Logo size="md" />
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) => getNavLinkClassName(isActive)}
                            >
                                <item.icon className="w-4 h-4 mr-2" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-3">
                        {/* Emergency alerts button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex relative"
                            aria-label={`${emergencyAlerts} emergency alerts`}
                        >
                            {emergencyAlerts > 0 ? (
                                <BellRing className="w-4 h-4 text-red-500" />
                            ) : (
                                <Bell className="w-4 h-4" />
                            )}
                            {emergencyAlerts > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {emergencyAlerts}
                                </span>
                            )}
                        </Button>

                        {/* Dark mode toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDarkMode}
                            className="hidden sm:inline-flex"
                            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {darkMode ? (
                                <Sun className="w-4 h-4" />
                            ) : (
                                <Moon className="w-4 h-4" />
                            )}
                        </Button>

                        {/* Desktop Auth Section */}
                        {isAuthenticated && user ? (
                            <div className="hidden sm:flex items-center space-x-4">
                                {/* Appointments Link */}
                                <NavLink
                                    to="/appointments"
                                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Appointments
                                </NavLink>

                                {/* User Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <User className="w-4 h-4 text-primary-600" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Hi, {user.name.split(' ')[0]}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-neutral-200 dark:border-neutral-700">
                                        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                                        </div>

                                        <NavLink
                                            to="/profile"
                                            className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4 mr-3" />
                                            My Profile
                                        </NavLink>

                                        <NavLink
                                            to="/health"
                                            className="flex items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Heart className="w-4 h-4 mr-3" />
                                            Health Dashboard
                                        </NavLink>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center space-x-3">

                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSignup}
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 mt-2 pt-2 pb-3">
                        <div className="px-2 space-y-1">
                            {/* Navigation links */}
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => getNavLinkClassName(isActive, true)}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </NavLink>
                            ))}

                            {/* Mobile menu actions */}
                            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                                {/* Dark Mode Toggle */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    fullWidth
                                    onClick={toggleDarkMode}
                                    leftIcon={darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                >
                                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                                </Button>

                                {/* Mobile Auth Section */}
                                {isAuthenticated && user ? (
                                    <>
                                        {/* User Info */}
                                        <div className="px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    ) : (
                                                        <User className="w-5 h-5 text-primary-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Links */}
                                        <NavLink
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            My Profile
                                        </NavLink>

                                        <NavLink
                                            to="/health"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                        >
                                            <Heart className="w-4 h-4 mr-2" />
                                            Health Dashboard
                                        </NavLink>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            fullWidth
                                            onClick={handleLogout}
                                            leftIcon={<LogOut className="w-4 h-4" />}
                                        >
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            fullWidth
                                            onClick={handleLogin}
                                            leftIcon={<UserCircle className="w-4 h-4" />}
                                        >
                                            Sign In
                                        </Button>

                                        <Button
                                            variant="primary"
                                            size="sm"
                                            fullWidth
                                            onClick={handleSignup}
                                        >
                                            Sign Up
                                        </Button>
                                    </>
                                )}

                                {/* Emergency Call */}
                                <Button
                                    variant="danger"
                                    size="sm"
                                    fullWidth
                                    leftIcon={<AlertTriangle className="w-4 h-4" />}
                                    onClick={handleEmergencyCall}
                                >
                                    Emergency Call
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
