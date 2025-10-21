export default function MovieCard({ movie }) {
  return (
    <div className="card" role="listitem" aria-label={movie.title}>
      <img src={movie.poster} alt={movie.title} loading="lazy" />
      <div className="meta">
        <div style={{ fontWeight: 600 }}>{movie.title}</div>
        <div className="badge">{movie.year}</div>
      </div>
    </div>
  );
}
