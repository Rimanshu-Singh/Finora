import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found.</h1>
      <p>Let’s get back to your everyday.</p>
      <Link className="button" href="/">
        Back to overview
      </Link>
    </div>
  );
}
