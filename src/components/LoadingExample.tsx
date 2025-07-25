import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function LoadingExample() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData('Data loaded successfully!');
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4">
      {/* Inline spinner usage */}
      <div>
        {loading && <Spinner />}
        {!loading && data && <p>{data}</p>}
      </div>

      {/* Spinner in a button */}
      <Button onClick={fetchData} disabled={loading}>
        {loading && <Spinner size="sm" variant="white" className="mr-2" />}
        {loading ? 'Loading...' : 'Fetch Data'}
      </Button>

      {/* Spinner in a card */}
      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center">
            <Spinner size="lg" variant="primary" />
          </div>
        ) : (
          <p>Content goes here</p>
        )}
      </Card>

      {/* Conditional rendering with spinner */}
      {loading ? <Spinner /> : <div>Your content</div>}

      {/* Spinner with custom styling */}
      {loading && (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span className="text-sm text-gray-500">Processing...</span>
        </div>
      )}
    </div>
  );
}