export default function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] md:min-h-[70vh] w-full">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">Memuat halaman, mohon tunggu...</p>
      </div>
    </div>
  );
}
