// src/components/AnalysisResults.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Smile,
  Tag,
  Frown,
  Palette,
  Angry,
  AlertTriangle,
  Package,
  Shield,
  SmilePlus,
  Presentation,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Analysis, Likelihood } from "@/types/analysis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "./NavBar";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EmojiIcon from "@/assets/yawn.gif";
import { Button } from "@/components/ui/button";

interface ImageUrls {
  introduction?: string | null;
  rising_action?: string | null;
  twist?: string | null;
  climax?: string | null;
  resolution?: string | null;
}

export default function AnalysisResults() {
  const [activeTab, setActiveTab] = useState<
    "emotions" | "elements" | "objects" | "safety"
  >("emotions");
  const navigate = useNavigate();
  const { state } = useLocation();
  const analysis = (state as any)?.analysis as Analysis | undefined;
  const imageUrls = (state as any)?.imageUrls as ImageUrls | undefined;

  useEffect(() => {
    console.log("AnalysisResults - State:", state);
    console.log("AnalysisResults - Analysis:", analysis);
    console.log("AnalysisResults - ImageUrls:", imageUrls);
  }, [state, analysis, imageUrls]);

  // It doesn't say exactly what percentage case maps to so we just guessed 
  const mapLikelihoodToConfidence = (likelihood: Likelihood) => {
    switch (likelihood) {
      case Likelihood.VeryLikely:
        return 95;
      case Likelihood.Likely:
        return 75;
      case Likelihood.Possible:
        return 55;
      case Likelihood.Unlikely:
        return 25;
      case Likelihood.VeryUnlikely:
        return 5;
      default:
        return 0;
    }
  };

  // Map the emotions to emoji
  const emotionMapping = [
    {
      name: "Joy",
      key: "joyLikelihood",
      icon: <Smile className="h-5 w-5 text-yellow-500" />,
    },
    {
      name: "Sorrow",
      key: "sorrowLikelihood",
      icon: <Frown className="h-5 w-5 text-blue-500" />,
    },
    {
      name: "Anger",
      key: "angerLikelihood",
      icon: <Angry className="h-5 w-5 text-red-500" />,
    },
    {
      name: "Surprise",
      key: "surpriseLikelihood",
      icon: <AlertTriangle className="h-5 w-5 text-purple-500" />,
    },
  ];

  if (!analysis) {
    return <div className="text-center py-8">No analysis data available</div>;
  }

  return (
    <>
      <Navbar />

      <Card className="p-5 mt-12 shadow-md hover:shadow-xl transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4">
        <CardHeader>
          <CardTitle>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              Artwork Narrative
            </h1>
          </CardTitle>
          <CardDescription>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
              Generated story based on visual analysis
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent className="m-3 rounded p-0 flex flex-col lg:flex-row gap-6">
          {/* Story Section */}
          <Card className="lg:basis-[65%] shadow-xl h-[calc(100vh-12rem)] overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-50">
                      Creative Interpretation
                    </CardTitle>
                    <CardDescription>
                      Generated story based on the artwork
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    navigate("/slideshow", { state: { analysis, imageUrls } })
                  }
                  variant="secondary"
                >
                  <Presentation className="mr-2 h-4 w-4" />
                  Create Slideshow
                </Button>
              </div>
            </CardHeader>

            <CardContent className="h-full p-4">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-8">
                  {analysis.story?.introduction && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">
                        <AnimatedGradientText className="text-lg">
                          Introduction
                        </AnimatedGradientText>
                      </h3>
                      <p className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                        {analysis.story.introduction}
                      </p>
                      {imageUrls?.introduction && (
                        <img
                          src={imageUrls.introduction}
                          alt="Introduction"
                          className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                        />
                      )}
                    </div>
                  )}

                  {analysis.story?.rising_action && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">
                        <AnimatedGradientText className="text-lg">
                          Rising Action
                        </AnimatedGradientText>
                      </h3>
                      <p className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                        {analysis.story.rising_action}
                      </p>
                      {imageUrls?.rising_action && (
                        <img
                          src={imageUrls.rising_action}
                          alt="Rising Action"
                          className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                        />
                      )}
                    </div>
                  )}

                  {analysis.story?.twist && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">
                        <AnimatedGradientText className="text-lg">
                          Plot Twist
                        </AnimatedGradientText>
                      </h3>
                      <p className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                        {analysis.story.twist}
                      </p>
                      {imageUrls?.twist && (
                        <img
                          src={imageUrls.twist}
                          alt="Plot Twist"
                          className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                        />
                      )}
                    </div>
                  )}

                  {analysis.story?.climax && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">
                        <AnimatedGradientText className="text-lg">
                          Climax
                        </AnimatedGradientText>
                      </h3>
                      <p className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                        {analysis.story.climax}
                      </p>
                      {imageUrls?.climax && (
                        <img
                          src={imageUrls.climax}
                          alt="Climax"
                          className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                        />
                      )}
                    </div>
                  )}

                  {analysis.story?.resolution && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary">
                        <AnimatedGradientText className="text-lg">
                          Resolution
                        </AnimatedGradientText>
                      </h3>
                      <p className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                        {analysis.story.resolution}
                      </p>
                      {imageUrls?.resolution && (
                        <img
                          src={imageUrls.resolution}
                          alt="Resolution"
                          className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                        />
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Analysis Section */}
          <Card className="flex-1 shadow-xl h-[calc(100vh-12rem)] overflow-hidden">
            <CardHeader className="pb-2 bg-gradient-to-r from-yellow-50 to-blue-50 dark:from-yellow-950/20 dark:to-blue-950/20">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-500">
                  {activeTab === "emotions" && <SmilePlus className="w-5 h-5" />}
                  {activeTab === "elements" && <Palette className="w-5 h-5" />}
                  {activeTab === "objects" && <Package className="w-5 h-5" />}
                  {activeTab === "safety" && <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {activeTab === "emotions" && "Emotional Analysis"}
                    {activeTab === "elements" && "Visual Elements"}
                    {activeTab === "objects" && "Object Detection"}
                    {activeTab === "safety" && "Content Safety"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "emotions" && "Detected facial expressions"}
                    {activeTab === "elements" && "Colors and labels detected in the image"}
                    {activeTab === "objects" && "Recognized objects in the artwork"}
                    {activeTab === "safety" && "Content safety assessment"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="h-full p-4 overflow-hidden">
              <Tabs
                defaultValue="emotions"
                value={activeTab}
                onValueChange={(v) =>
                  setActiveTab(v as "emotions" | "elements" | "objects" | "safety")
                }
                className="h-full flex flex-col"
              >
                <TabsList className="w-full grid grid-cols-4 mb-4">
                  <TabsTrigger value="emotions" className="flex items-center gap-2">
                    <Smile className="h-4 w-4" /> Emotions
                  </TabsTrigger>
                  <TabsTrigger value="elements" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Elements
                  </TabsTrigger>
                  <TabsTrigger value="objects" className="flex items-center gap-2">
                    <Package className="h-4 w-4" /> Objects
                  </TabsTrigger>
                  <TabsTrigger value="safety" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Safety
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-full pr-2">
                  <TabsContent value="emotions">
                    <CardDescription className="mb-4">
                      Detected facial expressions
                    </CardDescription>
                    {!analysis.faces?.length ? (
                      <div className="border rounded-lg flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center h-48 gap-4">
                          <div className="w-20 h-20 flex items-center justify-center">
                            <img
                              src={EmojiIcon}
                              alt="Emoji Icon"
                              className="w-full h-full object-cover filter drop-shadow-lg"
                            />
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            No faces detected
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
                            The artwork does not contain any recognizable human faces for emotional analysis.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-2">
                        <div className="space-y-8">
                          {analysis.faces.map((face, idx) => (
                            <div
                              key={`face-${idx}`}
                              className="p-4 bg-muted/30 rounded-lg border-2 hover:shadow-md transition-all duration-300"
                            >
                              <h3 className="text-lg font-medium mb-4">
                                Face #{idx + 1}
                              </h3>
                              {emotionMapping.map((emotion, i) => {
                                const confidence = mapLikelihoodToConfidence(
                                  (face as any)[emotion.key] as Likelihood
                                );
                                let progressColorClass = "";
                                switch (emotion.name) {
                                  case "Joy":
                                    progressColorClass = "[&>div]:bg-[#FAE32A]";
                                    break;
                                  case "Surprise":
                                    progressColorClass = "[&>div]:bg-[#F46B82]";
                                    break;
                                  case "Sorrow":
                                    progressColorClass = "[&>div]:bg-[#2C345C]";
                                    break;
                                  case "Anger":
                                    progressColorClass = "[&>div]:bg-[#FE0000]";
                                    break;
                                }
                                return (
                                  <div key={`e-${i}`} className="space-y-1 mb-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {emotion.icon}
                                        <span>{emotion.name}</span>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {confidence}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={confidence}
                                      className={`h-3 ${progressColorClass}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="elements">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Tag className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-medium text-lg">Labels</h3>
                        </div>
                        {analysis.labels?.length ? (
                          <div className="grid grid-cols-2 gap-2">
                            {analysis.labels.map((label, i) => (
                              <Badge
                                key={`l-${i}`}
                                className="justify-start gap-2 py-2 px-4 hover:bg-accent"
                                variant="secondary"
                              >
                                {label.description}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="border rounded-lg flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center h-48 gap-4">
                              <div className="w-20 h-20 flex items-center justify-center">
                                <img
                                  src={EmojiIcon}
                                  alt="No Labels"
                                  className="w-full h-full object-cover filter drop-shadow-lg"
                                />
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 font-medium">
                                No labels detected
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
                                The artwork does not contain any discernible labels.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-border w-full" />

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Palette className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-medium text-lg">Color Palette</h3>
                        </div>
                        {analysis.colors?.length ? (
                          <TooltipProvider>
                            <div className="flex rounded-md overflow-hidden shadow-sm">
                              {analysis.colors.slice(0, 6).map((color, i) => {
                                const hexCode =
                                  "#" +
                                  ((1 << 24) +
                                    (color.red << 16) +
                                    (color.green << 8) +
                                    color.blue)
                                    .toString(16)
                                    .slice(1)
                                    .toUpperCase();
                                return (
                                  <Tooltip key={`c-${i}`}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className="h-8 flex-1"
                                        style={{ backgroundColor: `rgb(${color.red}, ${color.green}, ${color.blue})` }}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" sideOffset={4}>
                                      <p className="text-sm">{hexCode}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          </TooltipProvider>
                        ) : (
                          <div className="border rounded-lg flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center h-48 gap-4">
                              <div className="w-20 h-20 flex items-center justify-center">
                                <img
                                  src={EmojiIcon}
                                  alt="No Colors"
                                  className="w-full h-full object-cover filter drop-shadow-lg"
                                />
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 font-medium">
                                No color palette detected
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
                                The artwork does not have a distinct color palette for analysis.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="objects">
                    {analysis.objects?.length ? (
                      <ScrollArea className="h-64">
                        <div className="grid grid-cols-2 gap-2 pr-4">
                          {analysis.objects.map((obj, i) => (
                            <Badge
                              key={`o-${i}`}
                              className="justify-start gap-2 py-2 px-4 hover:bg-accent"
                              variant="secondary"
                            >
                              {obj.name}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="border rounded-lg flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center justify-center h-48 gap-4">
                          <div className="w-20 h-20 flex items-center justify-center">
                            <img
                              src={EmojiIcon}
                              alt="No Objects"
                              className="w-full h-full object-cover filter drop-shadow-lg"
                            />
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            No objects detected
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
                            The artwork does not contain any recognizable objects for analysis.
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="safety">
                    <div className="grid grid-cols-2 gap-4">
                      {["adult", "violence", "medical", "spoof"].map((type) => (
                        <div key={type} className="p-3 bg-muted/30 rounded-lg border-2">
                          <div className="text-sm text-muted-foreground capitalize">
                            {type}
                          </div>
                          <div className="font-medium capitalize">
                            {(analysis.safeSearch as any)[type]?.toLowerCase() || "unknown"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );
}
