const API_BASE_URL = 'https://api.flowersarebait.site/api/v1';

export interface Series {
    id: number;
    slug: string;
    title: string;
    author: string;
    description: string;
    thumbnail_url: string;
    genre?: string;
    status: string;
    updated_at: string;
}

export interface Chapter {
    id: number;
    series_id: number;
    chapter_number: number;
    title: string;
    content?: string;
    created_at: string;
}

export const api = {
    async getSeries(): Promise<Series[]> {
        const response = await fetch(`${API_BASE_URL}/series?limit=1000`); // Fetch all
        if (!response.ok) throw new Error('Failed to fetch series');
        const data = await response.json();
        return data.data || [];
    },

    async getSeriesBySlug(slug: string): Promise<Series> {
        const response = await fetch(`${API_BASE_URL}/series/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch series details');
        return response.json();
    },

    async getChapters(slug: string): Promise<Chapter[]> {
        const response = await fetch(`${API_BASE_URL}/series/${slug}/chapters?limit=1000`); // Fetch all chapters
        if (!response.ok) throw new Error('Failed to fetch chapters');
        const data = await response.json();
        return data.data || [];
    },

    async getChapterContent(id: number): Promise<Chapter> {
        const response = await fetch(`${API_BASE_URL}/chapters/${id}`);
        if (!response.ok) throw new Error('Failed to fetch chapter content');
        return response.json();
    }
};
