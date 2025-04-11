
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, Image } from "lucide-react";
import { GenerateImage } from "@/api/integrations";

export default function ImageGenerator({ title, description, onImageGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Create a prompt based on title and description
      const prompt = `single line artistic vector drawing with a gentle touch of color of ${title}: ${description}`;
      
      // Call the GenerateImage integration
      const response = await GenerateImage({ prompt });
      
      if (response && response.url) {
        setGeneratedImageUrl(response.url);
        // Pass the image URL to the parent component
        if (onImageGenerated) {
          onImageGenerated(response.url);
        }
      } else {
        setError("Failed to generate image. Please try again.");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      setError("Error generating image. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Generate Image</h3>
          {generatedImageUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateImage}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Regenerate
            </Button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {generatedImageUrl ? (
          <div className="relative aspect-video rounded-md overflow-hidden">
            <img 
              src={generatedImageUrl} 
              alt="Generated illustration" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="bg-gray-100 rounded-md p-6 text-center">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
                <p className="text-gray-500">Generating your image...</p>
                <p className="text-xs text-gray-400">This may take a few moments</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <Image className="h-10 w-10 text-gray-400" />
                <p className="text-gray-500">No image generated yet</p>
                <p className="text-xs text-gray-400">
                  Generate an artistic illustration based on the title and description
                </p>
              </div>
            )}
          </div>
        )}
        
        {!isGenerating && !generatedImageUrl && (
          <Button 
            className="w-full" 
            onClick={generateImage}
          >
            Generate Image
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
