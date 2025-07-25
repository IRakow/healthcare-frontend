export function PillSpinner() {
  return (
    <div className="flex justify-center items-center h-32">
      <div className="w-10 h-10 relative animate-spin-slow">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-yellow-300 rounded-full rotate-45 shadow-md"></div>
        <div className="absolute inset-0 w-1/2 bg-white rounded-full rotate-45 origin-left shadow-inner"></div>
      </div>
    </div>
  );
}