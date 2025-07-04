export default function PageError({ error }: { error: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[70vh] w-full text-center px-4">
      <div className="text-4xl font-bold text-red-500 mb-2">
        {error ? JSON.stringify(error?.message) : "Terjadi Kesalahan"}
      </div>
      <p className="text-gray-600 mb-4">
        Kami tidak dapat memuat data saat ini. Silakan coba beberapa saat lagi.
      </p>
      <button
        onClick={() => location.reload()}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
      >
        Muat Ulang
      </button>
    </div>
  );
}
