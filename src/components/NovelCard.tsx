import React from 'react';
import { Link } from 'react-router-dom';
import { Series } from '../services/api';

interface NovelCardProps {
    series: Series;
    index: number;
}

const NovelCard: React.FC<NovelCardProps> = ({ series, index }) => {
    // Generate a determinstic gradient based on the index/id for visual variety
    const getGradient = (id: number) => {
        const hue = (id * 137.508) % 360; // Golden angle approximation
        return `linear-gradient(135deg, hsl(${hue}, 40%, 80%) 0%, hsl(${hue}, 45%, 70%) 100%)`;
    };

    return (
        <Link to={`/novel/${series.slug}`} className="novel-card">
            <div
                className="novel-cover"
                style={{ background: getGradient(series.id) }}
            >
                {series.title.substring(0, 2).toUpperCase()}
            </div>
            <div className="novel-info">
                <h3 className="novel-title" title={series.title}>{series.title}</h3>
                <span className="novel-author">By {series.author || 'Unknown'}</span>
            </div>
        </Link>
    );
};

export default NovelCard;
