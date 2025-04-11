
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPageUrl } from "@/utils";
import { GenerateImage } from "@/api/integrations";
import { Venture } from "@/api/entities";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export default function VentureEditor() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Business",
    image: "",
    wants_needs: []
  });
  const [newTag, setNewTag] = useState("");
  const [existingVenture, setExistingVenture] = useState(null);
  const [existingTags, setExistingTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  useEffect(() => {
    // Load venture data if editing existing venture
    const loadVenture = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ventureId = urlParams.get('id');
      if (ventureId) {
        try {
          const venture = await Venture.filter({id: ventureId});
          if (venture && venture.length > 0) {
            setExistingVenture(venture[0]);
            setFormData({
              title: venture[0].title || "",
              description: venture[0].description || "",
              category: venture[0].category || "Business",
              image: venture[0].image || "",
              wants_needs: venture[0].wants_needs || []
            });
          }
        } catch (error) {
          console.error("Error loading venture:", error);
          toast({
            variant: "destructive",
            description: "Error loading venture data"
          });
        }
      }
    };
    loadVenture();
  }, []);

  useEffect(() => {
    loadExistingTags();
  }, []);

  const loadExistingTags = async () => {
    setIsLoadingTags(true);
    try {
      // Fetch all ventures to extract unique tags
      const ventures = await Venture.list();
      
      // Collect all tags from wants_needs across all ventures
      const allTags = new Set();
      ventures.forEach(venture => {
        if (venture.wants_needs && Array.isArray(venture.wants_needs)) {
          venture.wants_needs.forEach(tag => allTags.add(tag));
        }
      });
      
      // Convert to array and sort alphabetically
      setExistingTags(Array.from(allTags).sort());
    } catch (error) {
      console.error("Error loading existing tags:", error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  const handleImageGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = customPrompt || `Create an artistic illustration for a venture named ${formData.title}: ${formData.description}`;
      const response = await GenerateImage({ prompt });
      if (response?.url) {
        setFormData(prev => ({ ...prev, image: response.url }));
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive", 
        description: "Error generating image"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.wants_needs.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        wants_needs: [...prev.wants_needs, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      wants_needs: prev.wants_needs.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddExistingTag = (tag) => {
    if (!formData.wants_needs.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        wants_needs: [...prev.wants_needs, tag]
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a venture name"
      });
      return false;
    }
    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a description"
      });
      return false;
    }
    if (!formData.image) {
      toast({
        variant: "destructive",
        description: "Please generate or provide an image"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      // Get current user info
      const user = await User.me();
      const members = await Member.list();
      const currentMember = members.find(m => 
        m.email?.toLowerCase().trim() === user.email?.toLowerCase().trim()
      );

      // Prepare the venture data
      const ventureData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image: formData.image,
        wants_needs: formData.wants_needs,
        owner_id: currentMember?.id || null,
        owner_name: user.full_name || "",
        owner_image: user.profile_image || currentMember?.profile_image || ""
      };

      // Create or update the venture
      if (existingVenture) {
        await Venture.update(existingVenture.id, ventureData);
        toast({
          description: "Venture updated successfully"
        });
      } else {
        await Venture.create(ventureData);
        toast({
          description: "Venture created successfully"
        });
      }

      // Navigate back to ventures list
      navigate(createPageUrl("Ventures"));
    } catch (error) {
      console.error("Error saving venture:", error);
      toast({
        variant: "destructive",
        description: "Error saving venture"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-[#6B4F4F] mb-6">
            {existingVenture ? "Edit Venture" : "New Venture"}
          </h1>

          <div className="space-y-6">
            {/* Image Section */}
            <div>
              <Label>Image</Label>
              {formData.image ? (
                <div className="mt-2 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={formData.image} 
                    alt="Venture" 
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
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : "Generate Image"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">Venture Name</Label>
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
              <Label>Venture Type</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Social Impact">Social Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags - Updated with browsable tags option */}
            <div>
              <Label>Wants & Needs (Tags)</Label>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline"
                      className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3]"
                    >
                      Browse Tags
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm mb-2">Existing Tags</h4>
                      {isLoadingTags ? (
                        <div className="flex justify-center py-2">
                          <Loader2 className="h-5 w-5 animate-spin text-[#905B40]" />
                        </div>
                      ) : existingTags.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {existingTags
                              .filter(tag => !formData.wants_needs.includes(tag))
                              .map((tag, i) => (
                                <Badge 
                                  key={i}
                                  className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3] cursor-pointer hover:bg-[#F0DEC3]"
                                  onClick={() => handleAddExistingTag(tag)}
                                >
                                  + {tag}
                                </Badge>
                              ))
                            }
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No existing tags found</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {formData.wants_needs.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.wants_needs.map((tag, index) => (
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
                onClick={() => navigate(createPageUrl("Ventures"))}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#339085] hover:bg-[#2A7268]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingVenture ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  existingVenture ? "Update Venture" : "Create Venture"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
