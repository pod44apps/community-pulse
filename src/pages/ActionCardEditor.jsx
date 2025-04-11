import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPageUrl } from "@/utils";
import { GenerateImage } from "@/api/integrations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export default function ActionCardEditor() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Knowledge",
    image: "",
    location: "",
    quantity: 1,
    tags: []
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const loadActionCard = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const cardId = urlParams.get('id');
      if (cardId) {
        // Load action card data here
      }
    };
    loadActionCard();
  }, []);

  const handleImageGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = customPrompt || `Create an artistic illustration for an action card named ${formData.title}: ${formData.description}`;
      const response = await GenerateImage({ prompt });
      if (response?.url) {
        setFormData(prev => ({ ...prev, image: response.url }));
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    try {
      // Submit action card data
      navigate(createPageUrl("ActionCards"));
    } catch (error) {
      console.error("Error saving action card:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-[#6B4F4F] mb-6">
            {formData.id ? "Edit Action Card" : "New Action Card"}
          </h1>

          <div className="space-y-6">
            {/* Image Section */}
            <div>
              <Label>Image</Label>
              {formData.image ? (
                <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={formData.image} 
                    alt="Action Card" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed rounded-lg p-4">
                  <div className="text-center">
                    <Input
                      placeholder="Custom generation prompt (optional)"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="mb-2"
                    />
                    <Button 
                      onClick={handleImageGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? "Generating..." : "Generate Image"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Card Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                rows={4}
              />
            </div>

            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Knowledge">Knowledge</SelectItem>
                  <SelectItem value="Location">Location</SelectItem>
                  <SelectItem value="Talent Sharing">Talent Sharing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1"
                placeholder="Where is this taking place?"
              />
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="mt-1"
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="bg-[#F8ECD9] text-[#905B40] px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-[#6B4F4F]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("ActionCards"))}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#339085] hover:bg-[#2A7268]"
              >
                {formData.id ? "Update Action Card" : "Create Action Card"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}