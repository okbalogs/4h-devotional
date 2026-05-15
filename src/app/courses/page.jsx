import Link from "next/link";

export default function Courses() {
  return (
    <main style={{ padding: '80px 0', minHeight: '100vh', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3.6rem', color: '#9d4f14', marginBottom: '20px' }}>ECWA Masterclasses</h1>
      <p style={{ color: '#7a6555', maxWidth: '600px', margin: '0 auto 60px', fontSize: '1.1rem', lineHeight: '1.6' }}>
        Dive deeper into your faith with structured courses from our leading theologians and teachers.
      </p>

      <div className="framework-grid" style={{ maxWidth: '1000px', margin: '0 auto' }}>
         {[
           { id: 1, title: 'Understanding the Pentateuch', tags: 'Old Testament' },
           { id: 2, title: 'Pauline Epistles & Early Church', tags: 'New Testament' },
           { id: 3, title: 'Navigating Modern Apologetics', tags: 'Ministry' },
           { id: 4, title: 'Hermeneutics: The Art of Reading', tags: 'Foundations' }
         ].map(course => (
           <div key={course.id} className="framework-card" style={{ minHeight: '180px', alignItems: 'center', textAlign: 'center' }}>
             <span className="section-tag" style={{ border: '1px solid #9d4f14', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem' }}>{course.tags}</span>
             <h3 style={{ fontSize: '1.15rem', marginTop: '16px' }}>{course.title}</h3>
             <button style={{ marginTop: 'auto', background: 'none', border: 'none', color: '#9d4f14', fontWeight: 600, cursor: 'pointer' }}>View Details →</button>
           </div>
         ))}
      </div>
    </main>
  );
}
