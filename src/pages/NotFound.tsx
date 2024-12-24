import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          404
        </h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="text-lg text-gray-400">
          The page you're looking for seems to have drifted into a black hole.
          Let's get you back to known space.
        </p>
        <div className="space-x-4">
          <Button asChild variant="default">
            <Link to="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/simulations">Explore Simulations</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
