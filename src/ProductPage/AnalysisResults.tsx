import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Smile, Frown, Angry, AlertTriangle } from "lucide-react";
import { useLocation } from "react-router-dom";
import AnalysisSection from "./AnalysisSection";
import { Analysis, Likelihood } from "@/types/analysis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import Navbar from "./NavBar";
import { useEffect } from "react";

interface ImageUrls {
    introduction?: string | null;
    rising_action?: string | null;
    twist?: string | null;
    climax?: string | null;
    resolution?: string | null;
}

const AnalysisResults = () => {
    const { state } = useLocation();
    const analysis = state?.analysis as Analysis | undefined;
    const imageUrls = state?.imageUrls as ImageUrls | undefined;

    useEffect(() => {
        console.log("AnalysisResults - State:", state);
        console.log("AnalysisResults - Analysis:", analysis);
        console.log("AnalysisResults - ImageUrls:", imageUrls);
    }, [state, analysis, imageUrls]);

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
            <Card className="border-2 mt-12 shadow-md hover:shadow-xl transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4">
                <CardHeader>
                    <CardTitle>
                        <AnimatedGradientText className="text-3xl font-bold">
                            Artwork Narrative
                        </AnimatedGradientText>
                    </CardTitle>
                    <CardDescription>
                        Generated story based on visual analysis
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col lg:flex-row gap-6">
                    {/* Story Section */}
                    <div className="flex-1 space-y-8">
                        <AnalysisSection title="Creative Interpretation">
                            <div className="space-y-8">
                                {analysis.story?.introduction && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4">
                                        <h3 className="text-lg font-semibold mb-3 text-primary">
                                            <AnimatedGradientText className="text-lg">
                                                Introduction
                                            </AnimatedGradientText>
                                        </h3>
                                        <div className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                                            {analysis.story.introduction}
                                        </div>
                                        {imageUrls?.introduction && (
                                            <img
                                                src={imageUrls.introduction}
                                                alt="Introduction Illustration"
                                                className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                )}
                                {analysis.story?.rising_action && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
                                        <h3 className="text-lg font-semibold mb-3 text-primary">
                                            <AnimatedGradientText className="text-lg">
                                                Rising Action
                                            </AnimatedGradientText>
                                        </h3>
                                        <div className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                                            {analysis.story.rising_action}
                                        </div>
                                        {imageUrls?.rising_action && (
                                            <img
                                                src={imageUrls.rising_action}
                                                alt="Rising Action Illustration"
                                                className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                )}
                                {analysis.story?.twist && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 delay-200">
                                        <h3 className="text-lg font-semibold mb-3 text-primary">
                                            <AnimatedGradientText className="text-lg">
                                                Plot Twist
                                            </AnimatedGradientText>
                                        </h3>
                                        <div className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                                            {analysis.story.twist}
                                        </div>
                                        {imageUrls?.twist && (
                                            <img
                                                src={imageUrls.twist}
                                                alt="Plot Twist Illustration"
                                                className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                )}
                                {analysis.story?.climax && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 delay-300">
                                        <h3 className="text-lg font-semibold mb-3 text-primary">
                                            <AnimatedGradientText className="text-lg">
                                                Climax
                                            </AnimatedGradientText>
                                        </h3>
                                        <div className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                                            {analysis.story.climax}
                                        </div>
                                        {imageUrls?.climax && (
                                            <img
                                                src={imageUrls.climax}
                                                alt="Climax Illustration"
                                                className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                )}
                                {analysis.story?.resolution && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 delay-400">
                                        <h3 className="text-lg font-semibold mb-3 text-primary">
                                            <AnimatedGradientText className="text-lg">
                                                Resolution
                                            </AnimatedGradientText>
                                        </h3>
                                        <div className="text-gray-600 font-serif leading-relaxed whitespace-pre-line">
                                            {analysis.story.resolution}
                                        </div>
                                        {imageUrls?.resolution && (
                                            <img
                                                src={imageUrls.resolution}
                                                alt="Resolution Illustration"
                                                className="rounded-lg border-2 shadow-md mt-4 max-w-full h-auto hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </AnalysisSection>
                    </div>

                    {/* Analysis Widgets */}
                    <div className="flex-1 space-y-6">
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle>Emotional Analysis</CardTitle>
                                <CardDescription>Detected facial expressions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!analysis.faces?.length ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                        <p>No faces detected</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {analysis.faces.map((face, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-muted/30 rounded-lg border-2 hover:shadow-md transition-all duration-300"
                                            >
                                                {emotionMapping.map((emotion, idx) => {
                                                    const confidence =
                                                        mapLikelihoodToConfidence(
                                                            face[
                                                            emotion.key as keyof typeof face
                                                            ] as Likelihood
                                                        );
                                                    return (
                                                        <div key={idx} className="space-y-1 mb-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {emotion.icon}
                                                                    <span>{emotion.name}</span>
                                                                </div>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {confidence}%
                                                                </span>
                                                            </div>
                                                            <Progress value={confidence} className="h-2" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <AnalysisSection title="Visual Elements">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {analysis.labels?.map((label, index) => (
                                        <Badge key={index}>{label.description}</Badge>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {analysis.colors?.slice(0, 6).map((color, i) => (
                                        <div
                                            key={i}
                                            className="w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform"
                                            style={{
                                                backgroundColor: `rgb(${color.red},${color.green},${color.blue})`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </AnalysisSection>

                        <AnalysisSection title="Detected Objects">
                            <ScrollArea className="h-32">
                                <div className="grid grid-cols-2 gap-2 pr-4">
                                    {analysis.objects?.map((obj, i) => (
                                        <div
                                            key={i}
                                            className="text-sm p-2 bg-muted/10 rounded"
                                        >
                                            {obj.name}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </AnalysisSection>

                        <AnalysisSection title="Content Safety">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/30 rounded-lg border-2">
                                    <div className="text-sm text-muted-foreground">
                                        Adult Content
                                    </div>
                                    <div className="font-medium capitalize">
                                        {analysis.safeSearch?.adult?.toLowerCase() || "unknown"}
                                    </div>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg border-2">
                                    <div className="text-sm text-muted-foreground">Violence</div>
                                    <div className="font-medium capitalize">
                                        {analysis.safeSearch?.violence?.toLowerCase() ||
                                            "unknown"}
                                    </div>
                                </div>
                            </div>
                        </AnalysisSection>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default AnalysisResults;
