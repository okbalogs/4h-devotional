import Link from "next/link";

export default function Fellowship() {
  return (
    <main style={{ padding: '80px 0', minHeight: '100vh', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3.6rem', color: '#9d4f14', marginBottom: '20px' }}>Join the Fellowship</h1>
      <p style={{ color: '#7a6555', maxWidth: '600px', margin: '0 auto 60px', fontSize: '1.1rem', lineHeight: '1.6' }}>
        Physical and digital spaces designed to keep our community anchored in truth together.
      </p>

      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '60px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(157, 79, 20, 0.08)' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', color: '#3d2a1a', marginBottom: '20px' }}>Find a Small Group</h2>
        <p style={{ color: '#555', marginBottom: '40px' }}>
           Search our database of local and digital small groups reviewing the 4H framework together. True discipleship cannot happen in isolation.
        </p>
        <div style={{ display: 'flex', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
           <input type="text" placeholder="Enter Zip Code or City..." style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #eaddd3', background: '#fdf6ec' }} />
           <button className="btn-primary" style={{ border: 'none' }}>Search</button>
        </div>
      </div>
    </main>
  );
}
