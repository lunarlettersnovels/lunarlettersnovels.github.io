import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NovelDetail from './pages/NovelDetail';
import ChapterReader from './pages/ChapterReader';
import './index.css';

import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="/novel/:slug" element={<NovelDetail />} />
                    </Route>
                    <Route path="/novel/:slug/chapter/:id" element={<ChapterReader />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
