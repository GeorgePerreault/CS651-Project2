import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPinterest } from "@fortawesome/free-brands-svg-icons";
import { GenreDropdown, SelectedGenre } from "@/components/ui/genreDropdown";
import Navbar from "./NavBar";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import axios from "axios";

const ProductPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<SelectedGenre[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // const resetGenres = () => {
  //   setSelectedGenres([]);
  // };

  const startPinterestOAuth = () => {
    window.location.href = "http://localhost:8080/auth";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file || !user) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("image", file);
      formData.append("userId", user.id);
      const genresData = selectedGenres.map((genre) => ({
        id: genre.id,
        style: genre.style,
      }));
      formData.append("genres", JSON.stringify(genresData));
      const { data } = await axios.post(
        "http://localhost:8080/api/artworks",
        formData
      );
      navigate("/results", {
        state: {
          analysis: data.analysis,
          imageUrls: data.imageUrls,
          genres: genresData,
        },
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      alert(error.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex items-center justify-center min-h-screen py-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,#3B82F6/10,transparent_70%)]"></div>
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="space-y-2 text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Upload Your{" "}
                <span className="text-primary italic">
                  <AnimatedGradientText className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Masterpiece
                  </AnimatedGradientText>
                </span>
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Upload or import your artwork to analyze its story and emotions.
              </p>
            </div>
            <Card className="border-2 shadow-md hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {!preview ? (
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors duration-300 group"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="h-12 w-12 text-muted-foreground mb-4 group-hover:text-primary transition-colors duration-300 group-hover:scale-110 transform" />
                      <h3 className="text-lg font-medium">
                        Drag and drop or click to upload
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports JPG, PNG, and WEBP up to 10MB
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="relative max-h-[400px] overflow-hidden rounded-lg border-2 shadow-md">
                        <img
                          src={preview}
                          alt="Artwork preview"
                          className="object-contain w-full max-h-[400px] transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Artwork Title</Label>
                          <Input
                            id="title"
                            placeholder="Enter the title of your artwork"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border-2 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="genre">Genres</Label>
                          <GenreDropdown
                            selectedGenres={selectedGenres}
                            onSelect={setSelectedGenres}
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={handleSubmit}
                        disabled={loading || !title}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Artwork"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="pinterest">
              <div className="flex items-center justify-center gap-4 my-6">
                <div className="h-px bg-border w-16"></div>
                <span className="text-muted-foreground font-medium">OR</span>
                <div className="h-px bg-border w-16"></div>
              </div>
              <div className="flex items-center justify-center">
              <div className="relative inline-block group">
  {/* Glow only on hover */}
  <div className="absolute inset-0 bg-red-600 rounded-md blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none"></div>

  <Button
    onClick={startPinterestOAuth}
    className="relative bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 py-2"
  >
    <FontAwesomeIcon icon={faPinterest} style={{ fontSize: "24px" }} />
    Import from Pinterest
  </Button>
</div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
