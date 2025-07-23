import { useEffect, useState } from 'react';

export default function LabOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders([
      { id: 1, patient: 'Sarah Jones', test: 'CBC Panel', date: '2025-07-01' },
      { id: 2, patient: 'David Lee', test: 'Lipid Panel', date: '2025-07-03' },
    ]);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧪 Lab Orders</h2>
      <table className="w-full table-auto text-sm border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th>Patient</th>
            <th>Test</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b">
              <td>{o.patient}</td>
              <td>{o.test}</td>
              <td>{o.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}