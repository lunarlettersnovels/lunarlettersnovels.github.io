const STORAGE_KEY = 'read_chapters';

interface ReadChapters {
    [seriesId: number]: number[]; // seriesId -> array of chapterIds
}

export const getReadChapters = (): ReadChapters => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

export const markChapterRead = (seriesId: number, chapterId: number) => {
    const current = getReadChapters();
    if (!current[seriesId]) {
        current[seriesId] = [];
    }
    if (!current[seriesId].includes(chapterId)) {
        current[seriesId].push(chapterId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
};

export const isChapterRead = (seriesId: number, chapterId: number): boolean => {
    const current = getReadChapters();
    return current[seriesId]?.includes(chapterId) || false;
};
