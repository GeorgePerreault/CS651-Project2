// src/components/PinsPage.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenreDropdown, SelectedGenre } from "@/components/ui/genreDropdown";
import { useUser } from "@clerk/clerk-react";
import Navbar from "./NavBar";
import Loader from "../components/ui/loader";

type ImageSet = Record<string, { url: string; width: number; height: number }>;

type Pin = {
  id: string;
  description: string | null;
  link: string;
  media: { images: ImageSet };
};

type User = {
  id: string;
  username: string;
  profile_image: string;
  follower_count: number;
  following_count: number;
  pin_count: number;
  website_url: string | null;
};

// Our page for displaying a user's pintrest pins for selection before importing
export default function PinsPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [pins, setPins] = useState<Pin[]>([]);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [title, setTitle] = useState("");
  const [genres, setGenres] = useState<SelectedGenre[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Fetch pins
  useEffect(() => {
    fetch("http://localhost:8080/api/pins", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) throw new Error("Authenticate via Pinterest");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json() as Promise<{ user: User; items: Pin[] }>;
      })
      .then((data) => {
        setProfile(data.user);
        setPins(data.items || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (imgs: ImageSet): string =>
    imgs["1200x"]?.url ||
    imgs["600x"]?.url ||
    imgs["400x300"]?.url ||
    Object.values(imgs)[0]?.url ||
    "";

  const openImportDialog = (pin: Pin) => {
    setSelectedPin(pin);
    setTitle(pin.description || "");
    setGenres([]);
  };

  const confirmImport = async () => {
    if (!user || !selectedPin) return;
    setImportingId(selectedPin.id);
    try {
      const rawUrl = getImageUrl(selectedPin.media.images);
      const imageUrl = `http://localhost:8080/api/proxy-image?url=${encodeURIComponent(
        rawUrl
      )}`;
      const payload = {
        userId: user.id,
        title,
        imageUrl,
        genres: genres.map((g) => ({ id: g.id, style: g.style })),
      };
      const { data } = await axios.post(
        "http://localhost:8080/api/artworks/import",
        payload
      );
      navigate("/results", {
        state: { analysis: data.analysis, imageUrls: data.imageUrls },
      });
      setSelectedPin(null);
    } catch (e) {
      console.error(e);
      setError("Import failed");
    } finally {
      setImportingId(null);
    }
  };

  if (loading)
    return (
      <div>
        <p className="text-center py-20">
          <Loader />
        </p>
      </div>
    );
  if (error)
    return (
      <div>
        <p className="text-center py-20 text-red-500">{error}</p>
      </div>
    );

  return (
    <>
      <Navbar />
      <main className="mt-14 p-6 md:p-10">
        {profile && (
          <div className="text-center mb-10 space-y-1">
            <div className="relative w-24 h-24 mx-auto mb-2">
              {/* Glowing ring */}
              <div className="absolute inset-0 rounded-full bg-red-500 blur-sm" />
              {/* Your profile image */}
              <img
                src={profile.profile_image}
                alt={profile.username}
                className="relative w-full h-full rounded-full border-2 border-red-500"
              />
            </div>
            <h1 className="text-3xl font-bold">@{profile.username}</h1>
            <p className="text-md text-gray-600">
              Followers: {profile.follower_count} | Following:{" "}
              {profile.following_count} | Pins: {profile.pin_count}
            </p>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4 text-center">
          Your{" "}
          <span className="text-3xl text-[#E60022] drop-shadow-[0_0_12px_rgba(230,0,34,0.8)]">
            Pinterest
          </span>{" "}
          Pins
        </h2>

        <div className="columns-masonry gap-6">
          {pins.map((pin) => {
            const rawUrl = getImageUrl(pin.media.images);
            const proxyUrl = `http://localhost:8080/api/proxy-image?url=${encodeURIComponent(
              rawUrl
            )}`;
            return (
              <div key={pin.id} className="relative mb-6 group">
                <img
                  src={proxyUrl}
                  alt={pin.description || "Untitled"}
                  className="w-full rounded-lg object-cover shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Button
                    className="cursor-none"
                    size="sm"
                    onClick={() => openImportDialog(pin)}
                    disabled={importingId === pin.id}
                  >
                    {importingId === pin.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Pick"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Dialog
          open={!!selectedPin}
          onOpenChange={(open) => {
            if (!open) setSelectedPin(null);
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Import Pin for Analysis</DialogTitle>
            </DialogHeader>
            {selectedPin && (
              <div className="space-y-4">
                {(() => {
                  const rawUrl = getImageUrl(selectedPin.media.images);
                  const proxyUrl = `http://localhost:8080/api/proxy-image?url=${encodeURIComponent(
                    rawUrl
                  )}`;
                  return (
                    <img
                      src={proxyUrl}
                      className="w-full rounded"
                      alt="Selected Pin"
                    />
                  );
                })()}
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Genres</Label>
                  <GenreDropdown
                    selectedGenres={genres}
                    onSelect={setGenres}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedPin(null)}>
                Cancel
              </Button>
              <Button onClick={confirmImport} disabled={!title || !!importingId}>
                {importingId ? "Importing…" : "Import & Analyze"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
