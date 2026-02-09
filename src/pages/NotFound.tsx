import { Home, Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-10 max-w-md"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 border border-primary/20">
          <Music2 className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-6xl font-display font-bold text-gradient mb-4">404</h1>
        <h2 className="text-xl font-display font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Looks like this track doesn't exist in our library. Let's get you back to the music.
        </p>

        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </motion.div>
    </div>
  );
}
