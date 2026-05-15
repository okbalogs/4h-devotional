import Link from "next/link";

export default function Support() {
  return (
    <main style={{ padding: '100px 0', textAlign: 'center', minHeight: '100vh' }}>
      <div style={{ width: '80px', height: '80px', background: '#fdf6ec', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#9d4f14', fontSize: '2rem' }}>
        💌
      </div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3.2rem', color: '#3d2a1a', marginBottom: '20px' }}>How can we help?</h1>
      <p style={{ color: '#7a6555', maxWidth: '500px', margin: '0 auto 40px', fontSize: '1.1rem', lineHeight: '1.6' }}>
        If you are experiencing issues with your account, have billing questions, or just want to share a testimony, our parish support team is here.
      </p>

      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(157, 79, 20, 0.08)', textAlign: 'left' }}>
        <div style={{ marginBottom: '24px' }}>
           <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', color: '#3d2a1a' }}>YOUR EMAIL</label>
           <input type="email" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1.5px solid #eaddd3', background: '#fdf6ec', outline: 'none' }} placeholder="hello@example.com" />
        </div>
        <div style={{ marginBottom: '30px' }}>
           <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px', color: '#3d2a1a' }}>HOW CAN WE ASSIST?</label>
           <textarea style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1.5px solid #eaddd3', background: '#fdf6ec', outline: 'none', minHeight: '150px', resize: 'vertical' }} placeholder="Describe your issue or feedback..."></textarea>
        </div>
        <button className="btn-primary" style={{ width: '100%', border: 'none' }}>Submit Support Ticket</button>
      </div>

      <div style={{ marginTop: '60px' }}>
         <Link href="/" style={{ color: '#9d4f14', fontWeight: 600 }}>← Return to Homepage</Link>
      </div>
    </main>
  );
}
