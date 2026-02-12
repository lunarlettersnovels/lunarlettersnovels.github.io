import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NovelDetail from './pages/NovelDetail';
import ChapterReader from './pages/ChapterReader';
import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/novel/:slug" element={<NovelDetail />} />
                    <Route path="/novel/:slug/chapter/:id" element={<ChapterReader />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
