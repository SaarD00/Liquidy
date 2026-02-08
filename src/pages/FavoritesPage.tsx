import { Heart } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="glass rounded-3xl p-8 max-w-sm space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">Favorites</h2>
        <p className="text-muted-foreground text-sm">
          Tracks you love will show up here. Tap the heart icon on any track to save it.
        </p>
      </div>
    </div>
  );
}
