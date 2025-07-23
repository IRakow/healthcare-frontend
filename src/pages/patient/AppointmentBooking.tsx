import { useState } from 'react';

export default function AppointmentBooking() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');

  const handleBook = () => {
    alert(`Appointment booked for ${date} at ${time}. Reason: ${reason}`);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">📅 Book Appointment</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input mb-2 w-full" />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input mb-2 w-full" />
      <input type="text" placeholder="Reason for visit" value={reason} onChange={(e) => setReason(e.target.value)} className="input mb-4 w-full" />
      <button onClick={handleBook} className="btn-primary w-full">Book Now</button>
    </div>
  );
}