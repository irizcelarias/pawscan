import { useState, useRef } from "react";
import { Upload, Camera, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      await analyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("pet-ai", {
        body: { type: "breed-detection", imageBase64 },
      });

      if (error) throw error;

      setResult(data.response);
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setPreviewImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          Discover Your Pet's{" "}
          <span className="text-gradient">Breed Instantly</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Upload a photo of your furry friend and our AI will identify their breed in seconds. Works with dogs, cats, and more!
        </p>

        <div
          className={`relative max-w-xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 animate-fade-in ${
            isDragging
              ? "border-primary bg-peach/50 scale-[1.02]"
              : "border-border bg-card hover:border-primary/50"
          } ${previewImage ? "p-4" : "p-10"}`}
          style={{ animationDelay: "0.2s" }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!previewImage ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-peach flex items-center justify-center animate-bounce-gentle">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Drag and drop your pet's photo here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex gap-3 mt-2">
                <Button variant="hero" size="lg" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-5 h-5" />
                  Upload Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Pet preview"
                  className="w-full max-h-80 object-contain rounded-xl"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <p className="font-medium text-foreground">Analyzing your pet...</p>
                    </div>
                  </div>
                )}
              </div>

              {result && (
                <div className="bg-secondary/50 rounded-xl p-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-lg">Analysis Results</h3>
                  </div>
                  <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {result}
                  </div>
                </div>
              )}

              <Button variant="outline" onClick={resetUpload}>
                Upload Another Photo
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
