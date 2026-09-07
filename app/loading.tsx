export default function Loading() {
  return (
    <div className="loading" aria-label="Loading page" role="status">
      <div className="skeleton short" />
      <div className="skeleton heading" />
      <div className="skeleton hero" />
      {Array.from({ length: 5 }, (_, i) => (
        <div className="skeleton row" key={i} />
      ))}
    </div>
  );
}
