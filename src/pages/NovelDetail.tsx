import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Series, Chapter } from '../services/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { isChapterRead } from '../services/progress';
import { CheckCircle } from 'lucide-react';

const NovelDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [series, setSeries] = useState<Series | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [readChapters, setReadChapters] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    usePageTitle(series ? series.title : 'Loading...');

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            try {
                const [seriesData, chaptersData] = await Promise.all([
                    api.getSeriesBySlug(slug),
                    api.getChapters(slug)
                ]);
                setSeries(seriesData);
                setChapters(chaptersData);

                // Check read status
                const readIds = chaptersData
                    .filter(c => isChapterRead(seriesData.id, c.id))
                    .map(c => c.id);
                setReadChapters(readIds);

            } catch (err) {
                setError('Failed to load novel details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    if (loading) return <div className="container" style={{ marginTop: '40px' }}>Loading details...</div>;
    if (error || !series) return <div className="container" style={{ marginTop: '40px' }}>Error: {error || 'Novel not found'}</div>;

    const getGradient = (id: number) => {
        const hue = (id * 137.508) % 360;
        return `linear-gradient(135deg, hsl(${hue}, 40%, 80%) 0%, hsl(${hue}, 45%, 70%) 100%)`;
    };

    return (
        <div className="container">
            <div className="novel-header">
                <div
                    className="novel-header-cover"
                    style={{ background: getGradient(series.id) }}
                >
                    {series.title.substring(0, 2).toUpperCase()}
                </div>
                <div className="novel-header-info">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{series.title}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--secondary-text)', marginBottom: '20px' }}>
                        By <span style={{ color: 'var(--text-color)' }}>{series.author || 'Unknown'}</span>
                    </p>

                    {series.genre && (
                        <div className="genres">
                            {series.genre.split(',').map((g: string, i: number) => (
                                <span key={i} className="genre-tag">{g.trim()}</span>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '20px' }}>
                        <h3>Synopsis</h3>
                        <div
                            style={{ lineHeight: '1.8', maxWidth: '800px' }}
                            dangerouslySetInnerHTML={{ __html: series.description || 'No description available.' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '60px', marginBottom: '10px' }}>
                <h3>Chapters ({chapters.length})</h3>
            </div>

            <div className="chapter-list">
                {chapters.map((chapter) => {
                    const isRead = readChapters.includes(chapter.id);
                    return (
                        <Link
                            key={chapter.id}
                            to={`/novel/${series.slug}/chapter/${chapter.id}`}
                            className="chapter-item"
                            style={isRead ? { borderColor: 'var(--accent-color)', opacity: 0.8 } : {}}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                {isRead && <CheckCircle size={14} color="green" />}
                                <span>Ch. {chapter.chapter_number}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default NovelDetail;
