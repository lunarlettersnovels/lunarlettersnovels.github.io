import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, Chapter, Series } from '../services/api';
import { ChevronLeft, ChevronRight, List, Maximize, Minimize } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { markChapterRead } from '../services/progress';

const ChapterReader = () => {
    const { slug, id } = useParams<{ slug: string; id: string }>();
    const navigate = useNavigate();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [immersive, setImmersive] = useState(false);

    usePageTitle(chapter ? chapter.title : 'Reading...');

    useEffect(() => {
        const fetchData = async () => {
            if (!slug || !id) return;
            setLoading(true);
            setError(null);
            try {
                const [content, list] = await Promise.all([
                    api.getChapterContent(Number(id)),
                    api.getChapters(slug)
                ]);

                setChapter(content);
                setChapters(list);

                // Mark as read
                if (content && content.series_id) {
                    markChapterRead(content.series_id, content.id);
                }

                window.scrollTo(0, 0);
            } catch (err) {
                setError('Failed to load chapter.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, id]);

    const currentIndex = chapters.findIndex(c => c.id === Number(id));
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    if (loading) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Loading chapter...</div>;
    if (error || !chapter) return <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>Error: {error || 'Chapter not found'}</div>;

    return (
        <div className={`reader-container ${immersive ? 'immersive' : ''}`}>
            {!immersive && (
                <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <Link to={`/novel/${slug}`} style={{ fontSize: '0.9rem', color: 'var(--secondary-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <List size={16} /> Back to Novels
                    </Link>
                    <h1 style={{ marginTop: '10px', fontSize: '2rem' }}>{chapter.title || `Chapter ${chapter.chapter_number}`}</h1>
                </div>
            )}

            <div className="immersive-toggle" onClick={() => setImmersive(!immersive)} title="Toggle Immersive Mode">
                {immersive ? <Minimize size={20} /> : <Maximize size={20} />}
            </div>

            <div className="reader-content">
                {chapter.content && (chapter.content.includes('<p>') || chapter.content.includes('<div>')) ? (
                    <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                ) : (
                    chapter.content?.split('\n').map((para, i) => (
                        <p key={i}>{para}</p>
                    ))
                )}
            </div>

            <div className="reader-nav">
                <button
                    className="nav-btn"
                    disabled={!prevChapter}
                    onClick={() => prevChapter && navigate(`/novel/${slug}/chapter/${prevChapter.id}`)}
                >
                    <ChevronLeft size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                    Previous
                </button>

                <Link to={`/novel/${slug}`} className="nav-btn">
                    Table of Contents
                </Link>

                <button
                    className="nav-btn"
                    disabled={!nextChapter}
                    onClick={() => nextChapter && navigate(`/novel/${slug}/chapter/${nextChapter.id}`)}
                >
                    Next
                    <ChevronRight size={16} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
                </button>
            </div>
        </div>
    );
};

export default ChapterReader;
