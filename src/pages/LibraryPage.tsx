import { Music } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="glass rounded-3xl p-8 max-w-sm space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Music className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">Your Library</h2>
        <p className="text-muted-foreground text-sm">
          Your saved tracks and playlists will appear here. Start by searching and playing some music!
        </p>
      </div>
    </div>
  );
}
