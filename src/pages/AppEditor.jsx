import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";

export default function AppEditor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "organization",
    icon: "📱",
    features: [],
    screenshots: []
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    const loadApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const appId = urlParams.get('id');
      if (appId) {
        // Load app data here
      }
    };
    loadApp();
  }, []);

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleSubmit = async () => {
    try {
      // Submit app data
      navigate(createPageUrl("AppStore"));
    } catch (error) {
      console.error("Error saving app:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-[#6B4F4F] mb-6">
            {formData.id ? "Edit App" : "Submit New App"}
          </h1>

          <div className="space-y-6">
            {/* Icon Selection */}
            <div>
              <Label>App Icon</Label>
              <div className="mt-2 p-4 border rounded-lg">
                <div className="text-4xl mb-2">{formData.icon}</div>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Enter an emoji for your app icon"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">App Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

            {/* Features */}
            <div>
              <Label>Features</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleAddFeature}
                >
                  Add
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {formData.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-[#F8F3EE] p-2 rounded-lg"
                    >
                      <span className="text-[#6B4F4F]">{feature}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(feature)}
                        className="text-[#905B40] hover:text-[#6B4F4F]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("AppStore"))}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#339085] hover:bg-[#2A7268]"
              >
                {formData.id ? "Update App" : "Submit App"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}