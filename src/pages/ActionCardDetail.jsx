
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  Upload, 
  X, 
  Tag as TagIcon
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { GenerateImage } from "@/api/integrations";
import { toast } from "@/components/ui/use-toast";
import { UploadFile } from "@/api/integrations";

export default function ActionCardDetail() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [card, setCard] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Card data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Knowledge");
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState([]);
  
  // Links
  const [links, setLinks] = useState([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  
  // Tags
  const [newTag, setNewTag] = useState("");
  
  // Image generation
  const [generationPrompt, setGenerationPrompt] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    const editMode = urlParams.get('edit') === 'true';
    
    setIsEdit(editMode || !cardId);
    
    if (cardId) {
      loadCardDetails(cardId);
    } else {
      // New card
      setIsLoading(false);
      setCard({});
    }
  }, []);
  
  const loadCardDetails = async (cardId) => {
    setIsLoading(true);
    try {
      // In a real app, you would fetch the specific card
      // For now use sample data
      const sampleCard = {
        id: cardId,
        title: "Vibe Coding",
        category: "Knowledge",
        description: "I know how to vibe code using base44",
        owner: {
          name: "Ronen Gafni",
          image: "https://example.com/profile.jpg"
        },
        quantity: 1,
        location: "",
        tags: ["Vibe Coding", "Base44", "No-Code"],
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1000",
        links: [
          { title: "Base44 Website", url: "https://base44.io" }
        ]
      };
      
      setCard(sampleCard);
      setTitle(sampleCard.title);
      setDescription(sampleCard.description);
      setCategory(sampleCard.category);
      setQuantity(sampleCard.quantity);
      setImage(sampleCard.image);
      setLocation(sampleCard.location || "");
      setTags(sampleCard.tags || []);
      setLinks(sampleCard.links || []);
      
    } catch (error) {
      console.error("Error loading card details:", error);
      toast({
        variant: "destructive",
        description: "Failed to load action card details"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a title for your action card"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const cardData = {
        title,
        description,
        category,
        quantity: Number(quantity),
        image,
        location,
        tags,
        links
      };
      
      // In a real app, you would save to database
      toast({
        description: card.id ? "Action card updated successfully" : "Action card created successfully"
      });
      
      // Redirect to action cards page
      navigate(createPageUrl("ActionCards"));
    } catch (error) {
      console.error("Error saving action card:", error);
      toast({
        variant: "destructive",
        description: "Failed to save action card"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setLinks([...links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }]);
      setNewLinkTitle("");
      setNewLinkUrl("");
    }
  };
  
  const handleRemoveLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };
  
  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const prompt = generationPrompt || `single line artistic vector drawing with a gentle touch of color of ${title}: ${description}`;
      
      const response = await GenerateImage({ prompt });
      
      if (response && response.url) {
        setImage(response.url);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        description: "Failed to generate image"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImage(file_url);
      toast({
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        description: "Failed to upload image"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(createPageUrl("ActionCards"))}
          className="text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Action Cards
        </Button>
        <h1 className="text-2xl font-semibold text-foreground ml-4">
          {card.id ? (isEdit ? "Edit" : "View") : "New"} Action Card
        </h1>
      </div>
      
      <Card className="border-none">
        <CardContent className="p-6 space-y-6">
          {/* Image Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Image</label>
            
            {image ? (
              <div className="relative rounded-md overflow-hidden h-64 bg-muted/20">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                {isEdit && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setImage("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="h-64 rounded-md border border-dashed border-muted flex items-center justify-center bg-muted/10">
                <div className="text-center p-4">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No image selected
                  </p>
                </div>
              </div>
            )}
            
            {isEdit && (
              <>
                <div className="flex mt-4 gap-2">
                  <Input
                    placeholder="Custom generation prompt (optional)"
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="bg-primary hover:bg-primary-hover text-white"
                  >
                    {isGenerating ? "Generating..." : "Generate Image"}
                  </Button>
                  {image && (
                    <Button
                      variant="outline"
                      onClick={() => setImage("")}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="flex justify-center mt-4">
                  <label className="flex-1 max-w-md">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <div className={`flex items-center justify-center w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-10 ${isUploading ? 'opacity-70' : ''}`}>
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </>
            )}
          </div>
          
          {/* Card Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name</label>
              {isEdit ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Action card name"
                  className="mt-1"
                />
              ) : (
                <p className="text-lg font-medium mt-1">{title}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Type</label>
              {isEdit ? (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Knowledge">Knowledge</SelectItem>
                    <SelectItem value="Location">Location</SelectItem>
                    <SelectItem value="Talent Sharing">Talent Sharing</SelectItem>
                    <SelectItem value="Resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className="mt-1 bg-secondary text-white">{category}</Badge>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              {isEdit ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you're offering"
                  className="mt-1 min-h-24"
                />
              ) : (
                <p className="mt-1 text-foreground/80">{description}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Quantity</label>
              {isEdit ? (
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1">{quantity}</p>
              )}
            </div>
            
            {(category === "Location" || location) && (
              <div>
                <label className="text-sm font-medium text-foreground">Location</label>
                {isEdit ? (
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Physical location (if applicable)"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1">{location}</p>
                )}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-foreground">Links</label>
              {links.length > 0 && (
                <div className="mt-2 space-y-2">
                  {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {isEdit ? (
                        <>
                          <span className="flex-1 text-foreground/80 truncate">
                            {link.title}: {link.url}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLink(index)}
                            className="h-8 w-8 text-destructive/70 hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {link.title}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {isEdit && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Link title"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddLink}
                    disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="bg-muted text-foreground border-muted px-3 py-1"
                  >
                    {tag}
                    {isEdit && (
                      <X
                        className="ml-2 h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
              
              {isEdit && (
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="pl-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {isEdit && (
            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("ActionCards"))}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                {isSaving ? "Saving..." : "Save Action Card"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
