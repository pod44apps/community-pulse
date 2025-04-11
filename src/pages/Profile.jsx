
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { User } from "@/api/entities";
import { Member } from "@/api/entities"; 
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UploadFile } from "@/api/integrations";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ElementSelector from "@/components/elements/ElementSelector";

// List of countries for dropdown
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "China", "India", "Brazil", 
  "South Africa", "Nigeria", "Egypt", "Israel", "Saudi Arabia", 
  "United Arab Emirates", "Singapore", "South Korea"
];

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profileImage: "",
    bio: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    interests: [],
    skills: [],
    primary_element: "",
    secondary_element: ""
  });

  // New interest/skill input state
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [memberId, setMemberId] = useState(null);
  const [commonSkills, setCommonSkills] = useState([]);
  const [commonInterests, setCommonInterests] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  // Add a new useEffect to load common skills and interests
  useEffect(() => {
    loadSuggestedTags();
  }, []);
  
  const loadSuggestedTags = async () => {
    try {
      // Fetch all members to extract common skills and interests
      const members = await Member.list();
      
      // Extract unique skills and interests
      const allSkills = new Set();
      const allInterests = new Set();
      
      members.forEach(member => {
        if (member.skills && Array.isArray(member.skills)) {
          member.skills.forEach(skill => allSkills.add(skill));
        }
        if (member.interests && Array.isArray(member.interests)) {
          member.interests.forEach(interest => allInterests.add(interest));
        }
      });
      
      // Sample skills if we want to add some defaults
      if (allSkills.size < 10) {
        ["Web Development", "Graphic Design", "Social Media", "Project Management", 
         "Marketing", "Coding", "Writing", "Community Building", "Teaching", 
         "Public Speaking", "Event Planning", "Video Production"].forEach(skill => 
          allSkills.add(skill)
        );
      }
      
      // Sample interests if we want to add some defaults
      if (allInterests.size < 10) {
        ["Sustainability", "Technology", "Art", "Music", "Travel", "Food", 
         "Education", "Health", "Environment", "Volunteering", "Cryptocurrencies", 
         "Spirituality", "Community", "Innovation"].forEach(interest => 
          allInterests.add(interest)
        );
      }
      
      setCommonSkills(Array.from(allSkills));
      setCommonInterests(Array.from(allInterests));
      
    } catch (error) {
      console.error("Error loading suggested tags:", error);
    }
  };

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      if (!currentUser?.email) {
        throw new Error("User not found");
      }

      const normalizedEmail = currentUser.email.toLowerCase().trim();
      
      const members = await Member.list();
      const memberRecord = members.find(m => 
        m.email?.toLowerCase().trim() === normalizedEmail
      );

      if (memberRecord) {
        setMemberId(memberRecord.id);
        
        setFormData({
          firstName: memberRecord.first_name || currentUser.full_name?.split(' ')[0] || '',
          lastName: memberRecord.last_name || currentUser.full_name?.split(' ').slice(1).join(' ') || '',
          profileImage: memberRecord.profile_image || currentUser.profile_image || '',
          bio: memberRecord.bio || '',
          city: memberRecord.city || '',
          country: memberRecord.country || '',
          phone: memberRecord.phone || '',
          email: normalizedEmail,
          interests: memberRecord.interests || [],
          skills: memberRecord.skills || [],
          primary_element: memberRecord.primary_element || "",
          secondary_element: memberRecord.secondary_element || ""
        });
      } else {
        setFormData({
          firstName: currentUser.full_name?.split(' ')[0] || '',
          lastName: currentUser.full_name?.split(' ').slice(1).join(' ') || '',
          profileImage: currentUser.profile_image || '',
          email: normalizedEmail,
          interests: [],
          skills: [],
          primary_element: "",
          secondary_element: ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        description: "Error loading profile data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profileImage: file_url }));
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        description: "Error uploading image"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      // Update user data
      await User.updateMyUserData({
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        profile_image: formData.profileImage
      });

      // Prepare member data
      const memberData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        profile_image: formData.profileImage,
        bio: formData.bio,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        interests: formData.interests,
        skills: formData.skills,
        primary_element: formData.primary_element,
        secondary_element: formData.secondary_element,
        status: 'approved'
      };

      if (memberId) {
        await Member.update(memberId, memberData);
      } else {
        const newMember = await Member.create(memberData);
        setMemberId(newMember.id);
      }

      toast({
        description: "Profile updated successfully"
      });

      // Navigate to dashboard after successful update
      navigate(createPageUrl("Dashboard"));

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        description: "Error updating profile"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-[#339085] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[#905B40]">Profile</h1>

      <Card className="bg-white border-none shadow-sm">
        <div className="p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {formData.profileImage ? (
                <div className="relative">
                  <img 
                    src={formData.profileImage} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 rounded-full bg-white/90 hover:bg-white"
                    onClick={() => setFormData(prev => ({ ...prev, profileImage: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-[#EDD6B3] flex items-center justify-center border-4 border-white shadow-sm">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-[#339085] animate-spin" />
                  ) : (
                    <div className="text-[#339085] text-4xl font-medium">
                      {formData.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              )}
              
              <div className="absolute inset-0 flex items-center justify-center">
                <label className="cursor-pointer rounded-full hover:bg-black/20 transition w-full h-full flex items-center justify-center">
                  <div className="bg-[#339085]/80 text-white rounded-lg py-1 px-2 shadow-lg">
                    <span className="text-sm font-medium">Upload Image</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="mt-1 resize-none h-24"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="mt-1"
                list="countries"
              />
              <datalist id="countries">
                {countries.map(country => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="mt-1"
            />
          </div>
          
          {/* Elemental Affinities */}
          <div className="space-y-6">
            <ElementSelector 
              label="Primary Element"
              value={formData.primary_element}
              onChange={(value) => setFormData(prev => ({ ...prev, primary_element: value }))}
            />
            
            <ElementSelector 
              label="Secondary Element"
              value={formData.secondary_element}
              onChange={(value) => setFormData(prev => ({ ...prev, secondary_element: value }))}
            />
          </div>

          {/* Interests */}
          <div>
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.interests.map((interest, index) => (
                <Badge 
                  key={index}
                  className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3] px-3 py-1 flex items-center gap-1"
                >
                  {interest}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => handleRemoveInterest(interest)}
                  />
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Add new interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                />
              </div>
              <Button onClick={handleAddInterest} className="bg-[#339085]">Add</Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3]">
                    Browse
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm mb-2">Common Interests</h4>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {commonInterests
                          .filter(interest => !formData.interests.includes(interest))
                          .map((interest, i) => (
                            <Badge 
                              key={i}
                              className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3] cursor-pointer hover:bg-[#F0DEC3]"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev, 
                                  interests: [...prev.interests, interest]
                                }));
                              }}
                            >
                              + {interest}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.skills.map((skill, index) => (
                <Badge 
                  key={index}
                  className="bg-[#E8E0D8] text-[#6B4F4F] border-[#E8E0D8] px-3 py-1 flex items-center gap-1"
                >
                  {skill}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Add new skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
              </div>
              <Button onClick={handleAddSkill} className="bg-[#339085]">Add</Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-[#E8E0D8] text-[#6B4F4F] border-[#E8E0D8]">
                    Browse
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm mb-2">Common Skills</h4>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {commonSkills
                          .filter(skill => !formData.skills.includes(skill))
                          .map((skill, i) => (
                            <Badge 
                              key={i}
                              className="bg-[#E8E0D8] text-[#6B4F4F] border-[#E8E0D8] cursor-pointer hover:bg-[#D8CFC7]"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev, 
                                  skills: [...prev.skills, skill]
                                }));
                              }}
                            >
                              + {skill}
                            </Badge>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("Dashboard"))}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              className="bg-[#339085]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
