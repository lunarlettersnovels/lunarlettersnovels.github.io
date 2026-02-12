import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, Chapter, Series } from '../services/api';
import { ChevronLeft, ChevronRight, List, Settings, ArrowLeft, Sun, Moon } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { markChapterRead } from '../services/progress';
import { useTheme } from '../context/ThemeContext';

const ChapterReader = () => {
    const { slug, id } = useParams<{ slug: string; id: string }>();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

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

    // Auto-hide controls
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
            controlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleMouseMove);
            if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        };
    }, []);


    const currentIndex = chapters.findIndex(c => c.id === Number(id));
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    if (loading) return <div className="reader-loading">Loading...</div>;
    if (error || !chapter) return <div className="reader-error">Error: {error || 'Chapter not found'}</div>;

    return (
        <div className={`isolated-reader ${theme}`}>
            {/* Top Bar - sticky/floating */}
            <div className={`reader-top-bar ${showControls ? 'visible' : ''}`}>
                <div className="bar-left">
                    <Link to={`/novel/${slug}`} className="icon-btn" title="Back to Novel">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="chapter-title-micro">{chapter.title}</span>
                </div>
                <div className="bar-right">
                    <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {/* Add font size controls here later if needed */}
                </div>
            </div>

            <div className="reader-content-wrapper">
                <h1 className="chapter-title-main">{chapter.title || `Chapter ${chapter.chapter_number}`}</h1>

                <div className="reader-text">
                    {chapter.content && (chapter.content.includes('<p>') || chapter.content.includes('<div>')) ? (
                        <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    ) : (
                        chapter.content?.split('\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Nav - floating */}
            <div className={`reader-bottom-bar ${showControls ? 'visible' : ''}`}>
                <button
                    className="nav-btn-floating"
                    disabled={!prevChapter}
                    onClick={() => prevChapter && navigate(`/novel/${slug}/chapter/${prevChapter.id}`)}
                >
                    <ChevronLeft size={24} />
                    <span>Prev</span>
                </button>

                <div className="progress-indicator">
                    {currentIndex + 1} / {chapters.length}
                </div>

                <button
                    className="nav-btn-floating"
                    disabled={!nextChapter}
                    onClick={() => nextChapter && navigate(`/novel/${slug}/chapter/${nextChapter.id}`)}
                >
                    <span>Next</span>
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default ChapterReader;
