import { Bus } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Bus size={32} />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Bus Ticketing System</h1>
      <p className="text-lg text-gray-600 max-w-lg text-center mb-8">
        Enterprise monorepo boilerplate running with React, Vite, Tailwind CSS, Express, and Prisma.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition shadow-sm">
          Book a Trip
        </button>
        <button className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
          Login
        </button>
      </div>
    </div>
  );
};

export default Home;
