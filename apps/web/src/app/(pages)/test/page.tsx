export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">Font Test Page</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Font Sans (Caudex)</h2>
          <p className="text-lg font-sans">
            This text should use the Caudex font. The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Font Serif (Handlee)</h2>
          <p className="text-lg font-serif">
            This text should use the Handlee font. The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Font Mono (Didact Gothic)</h2>
          <p className="text-lg font-mono">
            This text should use the Didact Gothic font. The quick brown fox jumps over the lazy dog.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">CSS Variables Test</h2>
          <p className="text-lg" style={{ fontFamily: 'var(--font-sans)' }}>
            Direct CSS variable test - should use Caudex
          </p>
          <p className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
            Direct CSS variable test - should use Handlee
          </p>
          <p className="text-lg" style={{ fontFamily: 'var(--font-mono)' }}>
            Direct CSS variable test - should use Didact Gothic
          </p>
        </div>
      </div>
    </div>
  );
}
