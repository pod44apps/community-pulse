import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import ImageGenerator from "@/components/ui/ImageGenerator";

export default function AddVentureModal({ onAddVenture }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Business Venture",
    image: "",
    wants_needs: []
  });
  const [newNeed, setNewNeed] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNeed = () => {
    if (newNeed.trim()) {
      setFormData((prev) => ({
        ...prev,
        wants_needs: [...prev.wants_needs, newNeed.trim()]
      }));
      setNewNeed("");
    }
  };

  const handleRemoveNeed = (index) => {
    setFormData((prev) => ({
      ...prev,
      wants_needs: prev.wants_needs.filter((_, i) => i !== index)
    }));
  };

  const handleImageGenerated = (imageUrl) => {
    setFormData((prev) => ({ ...prev, image: imageUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call onAddVenture with the form data
      if (onAddVenture) {
        await onAddVenture(formData);
      }
      
      // Reset form and close modal
      setFormData({
        title: "",
        description: "",
        category: "Business Venture",
        image: "",
        wants_needs: []
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding venture:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]">
          <Plus className="h-4 w-4" /> 
          New Venture
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Venture</DialogTitle>
          <DialogDescription>
            Add details about your new community venture
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Business Venture">Business Venture</SelectItem>
                <SelectItem value="Personal Venture">Personal Venture</SelectItem>
                <SelectItem value="Social Impact">Social Impact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="image">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Enter image URL or generate one"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowImageGenerator(!showImageGenerator)}
              >
                {showImageGenerator ? "Hide Generator" : "Generate Image"}
              </Button>
            </div>
            {formData.image && (
              <div className="mt-2 aspect-video bg-gray-100 rounded-md overflow-hidden">
                <img 
                  src={formData.image} 
                  alt="Venture preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = "https://placehold.co/600x400?text=Image+Error"}
                />
              </div>
            )}
          </div>
          
          {showImageGenerator && (
            <ImageGenerator
              title={formData.title}
              description={formData.description}
              onImageGenerated={handleImageGenerated}
            />
          )}
          
          <div className="grid w-full gap-1.5">
            <Label>Wants & Needs</Label>
            <div className="flex gap-2">
              <Input
                value={newNeed}
                onChange={(e) => setNewNeed(e.target.value)}
                placeholder="Add a want or need"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={handleAddNeed}
              >
                Add
              </Button>
            </div>
            
            {formData.wants_needs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.wants_needs.map((need, index) => (
                  <div 
                    key={index} 
                    className="bg-[#F8F3EE] text-[#8B4513] px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {need}
                    <button
                      type="button"
                      onClick={() => handleRemoveNeed(index)}
                      className="h-4 w-4 rounded-full bg-[#8B4513]/10 hover:bg-[#8B4513]/20 inline-flex items-center justify-center text-[#8B4513] ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Venture"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}