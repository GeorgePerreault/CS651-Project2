"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "./NavBar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterDialog, FilterSettings } from "../ProductPage/FilterDialog";
import { genres as genreList } from "../components/ui/genreDropdown";
import Loader from "../components/ui/loader";

interface ArtworkHistory {
  _id: string;
  title: string;
  genres: { id: string; style?: string }[];
  createdAt: string;
  imageUrl: string | null;
}

interface TransformedArtwork {
  id: string;
  title: string;
  date: string;
  tags: string[];
  thumbnail: string | null;
}

export default function ArtworkHistoryPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [allArtworks, setAllArtworks] = useState<TransformedArtwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<TransformedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArtworkId, setLoadingArtworkId] = useState<string | null>(null);
  const [deletingArtworkId, setDeletingArtworkId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterSettings>({
    tags: [],
    dateRange: null,
    sortBy: "newest",
  });

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios.get<ArtworkHistory[]>("http://localhost:8080/api/artworks/history", {
      params: { userId: user.id },
    })
        .then(({ data }) => {
          const transformed = data.map(a => ({
            id: a._id,
            title: a.title,
            date: a.createdAt,
            tags: a.genres.map(g => g.id),
            thumbnail: a.imageUrl,
          }));
          setAllArtworks(transformed);
          setFilteredArtworks(transformed);
        })
        .catch(err => console.error("Error fetching artworks:", err))
        .finally(() => setLoading(false));
  }, [user]);

  const allTags = Array.from(new Set(allArtworks.flatMap(a => a.tags)));

  const handleViewArtwork = (id: string) => {
    if (!user) return;
    setLoadingArtworkId(id);
    axios.get(`http://localhost:8080/api/artworks/${id}`, {
      params: { userId: user.id }
    })
        .then(({ data }) => {
          navigate("/results", {
            state: { analysis: data.analysis, imageUrls: data.storyImages }
          });
        })
        .catch(err => console.error("Failed to fetch artwork details:", err))
        .finally(() => setLoadingArtworkId(null));
  };

  const handleDeleteArtwork = async (id: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this artwork?");
    if (!confirmDelete) return;

    setDeletingArtworkId(id);
    try {
      await axios.delete(`http://localhost:8080/api/artworks/${id}`, {
        params: { userId: user.id }
      });

      // delete the Artworks from backend and frontend
      setAllArtworks(prev => prev.filter(a => a.id !== id));
      setFilteredArtworks(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete artwork:", err);
      alert("Failed to delete artwork. Please try again.");
    } finally {
      setDeletingArtworkId(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
  }

  return (
      <>
        <Navbar />
        <main className="container mx-auto mt-20 px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-rose-500">Artwork History</h2>
              <p className="text-muted-foreground">Browse your creative journey</p>
            </div>
            <div className="flex items-center gap-2">
              {activeFilters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mr-2">
                    {activeFilters.tags.map(tag => {
                      const g = genreList.find(x => x.id === tag);
                      return (
                          <Badge key={tag} variant="outline" className="capitalize">
                            {g ? g.name : tag}
                          </Badge>
                      );
                    })}
                  </div>
              )}
              <FilterDialog
                  allTags={allTags}
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                  setFilteredArtworks={setFilteredArtworks}
                  artworks={allArtworks}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtworks.map(art => (
                <Card key={art.id} className="group relative overflow-hidden">
                  <div className="aspect-video overflow-hidden mb-3 transform transition">
                    {art.thumbnail ? (
                        <img src={art.thumbnail} alt={art.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          No Image
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <CardHeader className="p-4 pt-0">
                    <CardTitle className="line-clamp-1">
                      {art.title.charAt(0).toUpperCase() + art.title.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {new Date(art.date).toLocaleDateString()}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {art.tags.map(tag => {
                        const g = genreList.find(x => x.id === tag);
                        return (
                            <Badge key={tag} variant="secondary" className="capitalize">
                              {g ? g.name : tag}
                            </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewArtwork(art.id)}
                        disabled={loadingArtworkId === art.id}
                    >
                      {loadingArtworkId === art.id ? "Loading…" : "View Details"}
                    </Button>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDeleteArtwork(art.id)}
                        disabled={deletingArtworkId === art.id}
                    >
                      {deletingArtworkId === art.id ? "Deleting…" : "Delete"}
                    </Button>
                  </CardFooter>
                </Card>
            ))}
          </div>
        </main>
      </>
  );
}
