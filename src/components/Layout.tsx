import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const Layout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="app-wrapper">
            <header className="site-header">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <span style={{ color: 'var(--accent-color)' }}>Lunar</span> Letters
                    </Link>
                    <nav>
                        <button
                            onClick={toggleTheme}
                            className="nav-link"
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </nav>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Lunar Letters. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
