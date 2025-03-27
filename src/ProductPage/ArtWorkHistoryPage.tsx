import { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Calendar, ImageIcon } from 'lucide-react';

interface ArtworkHistory {
  _id: string;
  title: string;
  genres: { id: string; style?: string }[];
  createdAt: string;
}

const ArtworkHistoryPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [artworkHistory, setArtworkHistory] = useState<ArtworkHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworkHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data } = await axios.get<ArtworkHistory[]>(`http://localhost:8080/api/artworks/history`, {
          params: { userId: user.id }
        });
        setArtworkHistory(data);
      } catch (error) {
        console.error('Failed to fetch artwork history:', error);
        // Optionally show error toast or message
      } finally {
        setLoading(false);
      }
    };

    fetchArtworkHistory();
  }, [user]);

  const handleViewArtwork = async (artworkId: string) => {
    if (!user) return;

    try {
      const { data } = await axios.get(`http://localhost:8080/api/artworks/${artworkId}`, {
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
      // Optionally show error toast or message
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin w-16 h-16 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 shadow-md">
            <CardHeader>
              <CardTitle>
                <AnimatedGradientText className="text-3xl font-bold">
                  Artwork History
                </AnimatedGradientText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {artworkHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <p>No artwork analyses found. Start creating your first story!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {artworkHistory.map((artwork) => (
                    <div 
                      key={artwork._id}
                      className="border-2 rounded-lg p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {artwork.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(artwork.createdAt).toLocaleDateString()}
                          </div>
                          {artwork.genres.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {artwork.genres.map((genre, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {genre.id} {genre.style ? `(${genre.style})` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewArtwork(artwork._id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ArtworkHistoryPage;