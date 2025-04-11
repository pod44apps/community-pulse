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

export default function AddAppModal({ onAddApp }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "organization",
    icon: "",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageGenerated = (imageUrl) => {
    setFormData((prev) => ({ ...prev, icon: imageUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call onAddApp with the form data
      if (onAddApp) {
        await onAddApp(formData);
      }
      
      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        category: "organization",
        icon: "",
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100"
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding app:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    { value: "blue", label: "Blue", textClass: "text-blue-600", bgClass: "bg-blue-100" },
    { value: "purple", label: "Purple", textClass: "text-purple-600", bgClass: "bg-purple-100" },
    { value: "green", label: "Green", textClass: "text-green-600", bgClass: "bg-green-100" },
    { value: "amber", label: "Amber", textClass: "text-amber-600", bgClass: "bg-amber-100" },
    { value: "red", label: "Red", textClass: "text-red-600", bgClass: "bg-red-100" },
    { value: "indigo", label: "Indigo", textClass: "text-indigo-600", bgClass: "bg-indigo-100" },
    { value: "cyan", label: "Cyan", textClass: "text-cyan-600", bgClass: "bg-cyan-100" },
    { value: "pink", label: "Pink", textClass: "text-pink-600", bgClass: "bg-pink-100" }
  ];

  const handleColorChange = (color) => {
    const selectedColor = colorOptions.find(c => c.value === color);
    
    if (selectedColor) {
      setFormData(prev => ({
        ...prev,
        iconColor: selectedColor.textClass,
        iconBg: selectedColor.bgClass
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]">
          <Plus className="h-4 w-4" /> 
          Submit App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit New App</DialogTitle>
          <DialogDescription>
            Add details about your community app submission
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="name">App Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
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
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="members">Members</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="integrations">Integrations</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="iconColor">Icon Color</Label>
            <Select
              value={colorOptions.find(c => c.textClass === formData.iconColor)?.value || "blue"}
              onValueChange={handleColorChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map(color => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${color.bgClass}`}></div>
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex items-center gap-2">
              <div className={`p-3 rounded-lg ${formData.iconBg}`}>
                <div className={`w-5 h-5 ${formData.iconColor}`}>●</div>
              </div>
              <span className="text-sm text-gray-500">Icon preview</span>
            </div>
          </div>
          
          <div className="grid w-full gap-1.5">
            <Label htmlFor="icon">Icon Image URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="Enter icon URL or generate one"
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
            {formData.icon && (
              <div className="mt-2 flex">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                  <img 
                    src={formData.icon} 
                    alt="App icon preview" 
                    className="w-full h-full object-contain"
                    onError={(e) => e.target.src = "https://placehold.co/64x64?text=Icon"}
                  />
                </div>
              </div>
            )}
          </div>
          
          {showImageGenerator && (
            <ImageGenerator
              title={formData.name}
              description={formData.description}
              onImageGenerated={handleImageGenerated}
            />
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit App"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}