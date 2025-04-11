import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { X, Upload, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UploadFile } from "@/api/integrations";

// List of countries for dropdown
const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "China", "India", "Brazil", 
  "South Africa", "Nigeria", "Egypt", "Israel", "Saudi Arabia", 
  "United Arab Emirates", "Singapore", "South Korea", "Thailand", 
  "Vietnam", "Mexico", "Argentina", "Chile", "Colombia", "Peru"
];

export default function PersonalInfoTab({ profileData, onUpdate, isUpdating }) {
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize form
  const form = useForm({
    defaultValues: {
      firstName: profileData?.first_name || "",
      lastName: profileData?.last_name || "",
      profileImage: profileData?.profile_image || "",
      bio: profileData?.bio || "",
      city: profileData?.city || "",
      country: profileData?.country || "",
      phone: profileData?.phone || "",
      skills: profileData?.skills || [],
      interests: profileData?.interests || [],
    }
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profileData) {
      form.reset({
        firstName: profileData?.first_name || "",
        lastName: profileData?.last_name || "",
        profileImage: profileData?.profile_image || "",
        bio: profileData?.bio || "",
        city: profileData?.city || "",
        country: profileData?.country || "",
        phone: profileData?.phone || "",
        skills: profileData?.skills || [],
        interests: profileData?.interests || [],
      });
    }
  }, [profileData, form]);

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const currentSkills = form.getValues("skills") || [];
    if (!currentSkills.includes(newSkill)) {
      form.setValue("skills", [...currentSkills, newSkill]);
    }
    setNewSkill("");
  };

  // Handle removing a skill
  const handleRemoveSkill = (skill) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter(s => s !== skill));
  };

  // Handle adding a new interest
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    const currentInterests = form.getValues("interests") || [];
    if (!currentInterests.includes(newInterest)) {
      form.setValue("interests", [...currentInterests, newInterest]);
    }
    setNewInterest("");
  };

  // Handle removing an interest
  const handleRemoveInterest = (interest) => {
    const currentInterests = form.getValues("interests") || [];
    form.setValue("interests", currentInterests.filter(i => i !== interest));
  };

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      form.setValue("profileImage", file_url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit form data
  const onSubmit = (data) => {
    // Basic validation
    if (!data.firstName || !data.lastName) {
      return;
    }
    onUpdate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Image */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {form.watch("profileImage") ? (
              <div className="relative">
                <img 
                  src={form.watch("profileImage")} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-md"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#EDD6B3] flex items-center justify-center border-4 border-white shadow-sm">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 text-[#339085] animate-spin" />
                ) : (
                  <div className="text-[#339085] text-4xl font-medium">
                    {form.watch("firstName")?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <label htmlFor="profileImage" className="cursor-pointer rounded-full hover:bg-black/20 transition w-full h-full flex items-center justify-center">
                <div className="bg-[#339085]/80 text-white rounded-lg py-1 px-2 shadow-lg">
                  <span className="text-sm font-medium">Upload Image</span>
                </div>
                <input 
                  id="profileImage" 
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

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#905B40]">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your first name" {...field} className="bg-white" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#905B40]">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your last name" {...field} className="bg-white" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Bio Field */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#905B40]">Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself" 
                  className="resize-none h-24 bg-white"
                  {...field} 
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#905B40]">City</FormLabel>
                <FormControl>
                  <Input placeholder="Your city" {...field} className="bg-white" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#905B40]">Country</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Phone Field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#905B40]">Phone</FormLabel>
              <FormControl>
                <Input placeholder="Your phone number" {...field} className="bg-white" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Interests Section */}
        <div>
          <FormLabel className="text-[#905B40]">Interests</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {form.watch("interests")?.map((interest) => (
              <Badge 
                key={interest} 
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
          
          <div className="mt-2">
            <Input
              placeholder="Add topics you're interested in"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
            />
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <FormLabel className="text-[#905B40]">Skills</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {form.watch("skills")?.map((skill) => (
              <Badge 
                key={skill} 
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
          
          <div className="mt-2">
            <Input
              placeholder="Add your professional skills"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="bg-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-[#339085] hover:bg-[#297971] text-white"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}