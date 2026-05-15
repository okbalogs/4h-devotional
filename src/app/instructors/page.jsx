import Link from "next/link";

export default function Instructors() {
  return (
    <main style={{ padding: '80px 0', minHeight: '100vh', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3.6rem', color: '#9d4f14', marginBottom: '20px' }}>Our Instructors</h1>
      <p style={{ color: '#7a6555', maxWidth: '600px', margin: '0 auto 60px', fontSize: '1.1rem', lineHeight: '1.6' }}>
        Learn from those who have dedicated their lives to the exposition of Scripture.
      </p>

      <div className="framework-grid" style={{ maxWidth: '1000px', margin: '0 auto' }}>
         {[
           { id: 1, name: 'Dr. Sarah Jenkins', role: 'Professor of Biblical History' },
           { id: 2, name: 'Rev. Thomas Cole', role: 'Senior Pastor, ECWA' },
           { id: 3, name: 'Lydia R. Hastings', role: 'Missiologist' }
         ].map(inst => (
           <div key={inst.id} className="framework-card" style={{ minHeight: '220px', alignItems: 'center', textAlign: 'center' }}>
             <img src={`https://i.pravatar.cc/150?img=${inst.id + 10}`} alt={inst.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px' }} />
             <h3 style={{ fontSize: '1.15rem' }}>{inst.name}</h3>
             <p style={{ fontSize: '0.85rem' }}>{inst.role}</p>
           </div>
         ))}
      </div>
    </main>
  );
}
