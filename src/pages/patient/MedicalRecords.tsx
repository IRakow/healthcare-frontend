import { useState } from 'react';

export default function MedicalRecords() {
  const [files, setFiles] = useState([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles([...files, ...selectedFiles]);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📁 Upload Medical Records</h2>
      <input type="file" multiple onChange={handleUpload} className="mb-4" />
      <ul className="list-disc pl-6">
        {files.map((f, i) => <li key={i}>{f.name}</li>)}
      </ul>
    </div>
  );
}