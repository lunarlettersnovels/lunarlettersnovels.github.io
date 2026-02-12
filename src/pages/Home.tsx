import React, { useEffect, useState } from 'react';
import { api, Series } from '../services/api';
import NovelCard from '../components/NovelCard';
import { usePageTitle } from '../hooks/usePageTitle';

const Home = () => {
    usePageTitle('Home');
    const [series, setSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSeries = async () => {
            try {
                const data = await api.getSeries();
                setSeries(data);
            } catch (err) {
                setError('Failed to load novels. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeries();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ padding: '40px 0', textAlign: 'center' }}>
                <p>Loading library...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '40px 0', textAlign: 'center', color: 'red' }}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="novel-grid">
                {series.map((item, index) => (
                    <NovelCard key={item.id} series={item} index={index} />
                ))}
            </div>
        </div>
    );
};

export default Home;
