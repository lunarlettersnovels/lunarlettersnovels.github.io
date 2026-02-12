import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Moon } from 'lucide-react';

const Layout = () => {
    return (
        <div className="app-wrapper">
            <header className="site-header">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <span style={{ color: 'var(--accent-color)' }}>Lunar</span> Letters
                    </Link>
                    <nav>
                        {/* Add nav links if needed */}
                        <a href="#" className="nav-link"><Moon size={20} /></a>
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
