import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white flex items-center justify-center px-6 py-12">
      {/* Decorative Bubbles (Blurred Circles) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Large bubbles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-700 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-12 w-72 h-72 bg-pink-700 opacity-25 rounded-full blur-3xl" />

        {/* Medium bubbles */}
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-indigo-600 opacity-20 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 bg-fuchsia-600 opacity-20 rounded-full blur-2xl" />

        {/* Small bubbles */}
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-purple-500 opacity-15 rounded-full blur-xl" />
        <div className="absolute bottom-1/3 left-1/5 w-20 h-20 bg-pink-500 opacity-10 rounded-full blur-xl" />
        <div className="absolute top-1/2 right-1/6 w-16 h-16 bg-indigo-400 opacity-10 rounded-full blur-xl" />
      </div>

      {/* Main Content */}
      <div className="z-10 text-center max-w-2xl">
        <h1 className="text-9xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          The page you're looking for doesn’t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300 font-medium shadow-lg transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
