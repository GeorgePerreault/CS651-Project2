import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import axios from "axios";
import { AnalysisApiResponse } from "@/types/analysis";
import Navbar from "./NavBar";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { GenreDropdown, SelectedGenre } from "@/components/ui/genreDropdown"; // Make sure to export SelectedGenre type in your GenreDropdown component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPinterest } from "@fortawesome/free-brands-svg-icons";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

  // New reset function for array-based genres
  const resetGenres = () => {
    setSelectedGenres([]);
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

      // Convert selected genres to format needed for API
      const genresData = selectedGenres.map((genre) => ({
        id: genre.id,
        style: genre.style,
      }));

      formData.append("genres", JSON.stringify(genresData));

      const { data } = await axios.post<AnalysisApiResponse>(
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
      alert(
        error.response?.data?.error || "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Getting count of selected genres
  // const selectedGenreCount = selectedGenres.length;

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
                Upload an image of your artwork to analyze its themes, colors,
                and emotions.
              </p>
            </div>

            <Card
              className="border-2 shadow-md hover:shadow-xl transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: "200ms" }}
            >
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {!preview ? (
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors duration-300 group"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
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
                    <div className="space-y-6">
                      <div className="relative max-h-[400px] overflow-hidden rounded-lg border-2 shadow-md">
                        <img
                          src={preview}
                          alt="Artwork preview"
                          className="object-contain w-full max-h-[400px] transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="text-base font-medium"
                          >
                            Artwork Title
                          </Label>
                          <Input
                            id="title"
                            placeholder="Enter the title of your artwork"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border-2 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <Label
                            className="text-base font-medium"
                            htmlFor="length"
                          >
                            Story Length
                          </Label>
                          <RadioGroup className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="short-story" id="r1" />
                              <Label htmlFor="r1">Short</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="long-story" id="r2" />
                              <Label htmlFor="r3">Long</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="genre"
                            className="text-base font-medium block"
                          >
                            Genres
                          </Label>
                          <GenreDropdown
                            selectedGenres={selectedGenres}
                            onSelect={setSelectedGenres}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="w-full transition-all duration-300 hover:border-primary"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                            setTitle("");
                            resetGenres();
                          }}
                        >
                          Change Image
                        </Button>
                        <Button
                          className="w-full relative overflow-hidden group"
                          onClick={handleSubmit}
                          disabled={loading || !title}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/50 to-primary group-hover:scale-125 group-hover:opacity-0 transition-all duration-500"></span>
                          <span className="relative z-10">
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                Analyzing...
                              </>
                            ) : (
                              "Analyze Artwork"
                            )}
                          </span>
                        </Button>
                      </div>
                    </div>
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
                <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 py-2">
                  <FontAwesomeIcon
                    icon={faPinterest}
                    style={{ fontSize: "24px" }}
                  />
                  Import from Pinterest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
