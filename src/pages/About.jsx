import { Users, Smile, Zap, Trophy } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white px-6 py-12 sm:py-20 overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        About Web Arcade
      </h1>

      {/* Description */}
      <p className="max-w-3xl mx-auto text-center text-gray-300 text-lg sm:text-xl leading-relaxed mb-16 px-4 sm:px-0">
        Web Arcade is your ultimate destination for classic and modern games
        reimagined for the web. Whether you're here to challenge your mind, test
        your reflexes, or just have some fun, we bring you a curated collection
        of engaging games — all in one place.
      </p>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <FeatureCard
          icon={<Users className="w-10 h-10 text-cyan-400" />}
          title="Community Driven"
          desc="Join a growing community of passionate gamers and share your high scores and achievements."
        />
        <FeatureCard
          icon={<Smile className="w-10 h-10 text-pink-400" />}
          title="User Friendly"
          desc="Intuitive interfaces and smooth gameplay designed for everyone — beginners to pros."
        />
        <FeatureCard
          icon={<Zap className="w-10 h-10 text-amber-400" />}
          title="Fast & Responsive"
          desc="Enjoy lag-free and seamless gaming experiences on any device, anywhere."
        />
        <FeatureCard
          icon={<Trophy className="w-10 h-10 text-purple-400" />}
          title="Challenge Yourself"
          desc="Compete in classic and new games with varying difficulties to push your limits."
        />
      </div>

      {/* Our Mission Section */}
      <section className="max-w-4xl mx-auto mt-20 bg-black/40 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/20">
        <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Our Mission
        </h2>
        <p className="text-gray-300 text-center text-lg leading-relaxed px-6">
          At Web Arcade, we strive to create a vibrant and fun online gaming hub
          that rekindles the joy of classic games while embracing modern web
          technology. Our mission is to provide an inclusive platform where
          players can relax, compete, and connect — all through the power of
          play.
        </p>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center text-center border border-white/10 shadow-md hover:shadow-purple-500/30 transition-shadow duration-300 cursor-default">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-300 text-sm">{desc}</p>
    </div>
  );
}
