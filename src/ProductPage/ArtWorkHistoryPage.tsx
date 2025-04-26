"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterDialog, FilterSettings } from "../ProductPage/FilterDialog";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./NavBar";
import { genres as genreList } from "../components/ui/genreDropdown";
import loader from "@/assets/loader.gif";
import lightloader from "@/assets/lightloader.gif"
import { useTheme } from "next-themes"; 
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
  const [, setLoadingArtworkId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterSettings>({
    tags: [],
    dateRange: null,
    sortBy: "newest",
  });
  const { theme } = useTheme();


  // Fetch artworks from backend
  useEffect(() => {
    const fetchArtworks = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await axios.get<ArtworkHistory[]>("https://backend-dot-visioncloudsite-457804.uw.r.appspot.com/api/artworks/history", {
          params: { userId: user.id },
        });
        // Transform each artwork to include the expected fields
        const transformed: TransformedArtwork[] = data.map((artwork) => ({
          id: artwork._id,
          title: artwork.title,
          date: artwork.createdAt,
          tags: artwork.genres.map((g) => g.id),
          thumbnail: artwork.imageUrl,
        }));
        setAllArtworks(transformed);
        setFilteredArtworks(transformed);
      } catch (error) {
        console.error("Error fetching artworks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, [user]);

  // Compute unique tags from all artworks
  const allTags = Array.from(
    new Set(allArtworks.flatMap((artwork) => artwork.tags))
  );

  const handleViewArtwork = async (artworkId: string) => {
    if (!user) return;
    try {
      setLoadingArtworkId(artworkId);
      const { data } = await axios.get(`https://backend-dot-visioncloudsite-457804.uw.r.appspot.com/api/artworks/${artworkId}`, {
        params: { userId: user.id }
      });
      navigate("/results", {
        state: {
          analysis: data.analysis,
          imageUrls: data.storyImages
        }
      });
    } catch (error) {
      console.error('Failed to fetch artwork details:', error);
      setLoadingArtworkId(null);
    }
  };


  if (loading) {
    return (
      <>
     
      
      <div className="min-h-screen bg-black flex justify-center items-center">
 {theme === "light" ? (
        <img
          src={lightloader}
          alt="Loading Light"
        
        
        />
      ) : (
       
        <img
          src={loader}
          alt="Loading Dark"
        />
       
      )}
</div>
</>
    );
  }

  return (
    <>
      <Navbar />
      {/* Ensure content is not hidden behind the navbar */}
      <main className="container mx-auto mt-20 px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-rose-500 dark:text-rose-400">
              Artwork History
            </h2>
            <p className="text-muted-foreground mt-2">
              Browse your creative journey through time
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeFilters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mr-2">
                {activeFilters.tags.map((tag) => {
                  const genre = genreList.find((g) => g.id === tag);
                  return (
                    <Badge key={tag} variant="outline" className="capitalize flex items-center gap-1">
                      {genre && <genre.icon className={`h-4 w-4 ${genre.color}`} />}
                      <span>{genre ? genre.name : tag}</span>
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
          {filteredArtworks.map((artwork) => (
            <Card
              key={artwork.id}
              className="group overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="aspect-video relative transition-transform duration-700 group-hover:scale-105">
                {artwork.thumbnail ? (
                  <>
                    <img
                      src={artwork.thumbnail}
                      alt={artwork.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                ) : (
                  <>
                    <img
                      src="/placeholder.svg"
                      alt="Placeholder"
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1">{artwork.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {new Date(artwork.date).toLocaleDateString()}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => {
                    const genre = genreList.find((g) => g.id === tag);
                    return (
                      <Badge key={tag} variant="secondary" className="capitalize flex items-center gap-1">
                        {genre && <genre.icon className={`h-4 w-4 ${genre.color}`} />}
                        <span>{genre ? genre.name : tag}</span>
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewArtwork(artwork.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
