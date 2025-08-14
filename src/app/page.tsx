import Link from 'next/link';
import './globals.css';

export default function HomePage() {
  return (
    <div className="container">
      <h1>AI Portfolio Pro</h1>
      <p>Choose a domain to explore advanced AI demos.</p>
      <div className="row">
        <div className="card" style={{flex:'1 1 320px'}}>
          <h2>Real Estate</h2>
          <p>Lead-qualifying chat widget, listing copy generator, follow-up copilot.</p>
          <Link className="btn" href="/real-estate">Open</Link>
        </div>
      </div>
    </div>
  );
}
