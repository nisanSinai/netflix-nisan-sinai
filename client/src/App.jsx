import { useEffect, useMemo, useRef, useState } from 'react';
import MovieCard from './components/MovieCard.jsx';
import { fetchMovies } from './api.js';

const PAGE_SIZE = 24;

export default function App() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const abortRef = useRef(null);
  const sentinelRef = useRef(null);

  const resetAndLoad = async () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    await loadPage(1, true);
  };

  const loadPage = async (nextPage = page, isReset = false) => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    // בטיחות כפולה: ביטול בקשה קודמת אם קיימת
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await fetchMovies({ page: nextPage, limit: PAGE_SIZE, search }, { signal: controller.signal });
      setItems(prev => (isReset ? data.items : [...prev, ...data.items]));
      setHasMore(nextPage < data.totalPages);
      setPage(nextPage + 1);
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'שגיאה');
    } finally {
      setLoading(false);
    }
  };

  // טעינת עמוד ראשון בהתחלה
  useEffect(() => {
    loadPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // השפעת חיפוש: debounce קטן
  const debouncedSearch = useDebounce(search, 350);
  useEffect(() => {
    resetAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // IntersectionObserver לטעינה אינסופית
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        loadPage();
      }
    }, { rootMargin: '600px 0px 600px 0px' });

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [hasMore, loading]);

  return (
    <div className="container">
      <div className="title">🎬 סרטים (Infinite Scroll)</div>
      <div className="toolbar">
        <input
          className="input"
          placeholder="חיפוש לפי שם…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search"
        />
      </div>

      {error && <div className="error">אירעה שגיאה: {error}</div>}

      <div className="grid" role="list" aria-live="polite">
        {items.map(m => <MovieCard key={m.id} movie={m} />)}
      </div>

      {items.length === 0 && !loading && !error && (
        <div className="empty">לא נמצאו תוצאות.</div>
      )}

      <div ref={sentinelRef} />

      {loading && <div className="loader">טוען…</div>}
      {!hasMore && items.length > 0 && (
        <div className="loader">הגעת לסוף 🎉</div>
      )}
    </div>
  );
}

function useDebounce(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

