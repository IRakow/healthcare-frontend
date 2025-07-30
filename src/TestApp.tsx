export default function TestApp() {
  return (
    <div style={{
      padding: '50px',
      textAlign: 'center',
      background: 'red',
      color: 'white',
      fontSize: '30px',
      minHeight: '100vh'
    }}>
      <h1>React is Working!</h1>
      <p>If you see this red page, React is loading correctly.</p>
      <p>Current URL: {window.location.href}</p>
    </div>
  );
}