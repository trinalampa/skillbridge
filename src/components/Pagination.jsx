// Reusable pagination bar.
// Props: page (1-based), totalPages, onPageChange
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>

      {pages.map(p => (
        <button
          key={p}
          className={`page-btn${p === page ? " active" : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
