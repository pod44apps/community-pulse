
import React, { useState, useEffect } from "react";
import { Member } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles } from "lucide-react";
import { 
  Search, 
  MapPin,
  MessageSquare,
  SlidersHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import MessageModal from "@/components/messages/MessageModal";
import ElementBadge from "@/components/elements/ElementBadge";

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Search options
  const [searchFields, setSearchFields] = useState({
    name: true,
    bio: true,
    location: true,
    skills: true,
    interests: true,
    ventures: true,
    actionCards: true
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await Member.list();
      
      // Add sample related data for demo purposes
      const enhancedData = data.map(member => ({
        ...member,
        relatedItems: {
          ventures: [
            { id: 'v1', title: 'Vibe Tokenomics', description: 'Blockchain economy for communities' },
            { id: 'v2', title: 'Digital Villages', description: 'Digital home for communities' }
          ],
          actionCards: [
            { id: 'a1', title: 'Vibe Coding', description: 'Teaching base44 development', category: 'Knowledge' },
            { id: 'a2', title: 'My Home in Pardes-Hanna', description: 'A great place for gatherings', category: 'Location' }
          ],
          primary_element: "water",
          secondary_element: "fire"
        }
      }));
      
      setMembers(enhancedData);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSearchField = (field) => {
    setSearchFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const filteredMembers = members.filter(member => {
    // Only show approved members
    if (member.status !== "approved") return false;
    
    // Check if they match the search term
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (member.first_name?.toLowerCase() || "").includes(searchLower) ||
      (member.last_name?.toLowerCase() || "").includes(searchLower) ||
      (member.bio?.toLowerCase() || "").includes(searchLower) ||
      (member.city?.toLowerCase() || "").includes(searchLower) ||
      (member.country?.toLowerCase() || "").includes(searchLower) ||
      (member.interests || []).some(interest => 
        interest.toLowerCase().includes(searchLower)
      ) ||
      (member.skills || []).some(skill => 
        skill.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleMessageClick = (e, member) => {
    e.stopPropagation(); // Prevent navigating to member profile
    setSelectedMember(member);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#905B40]">Community Members</h1>
        </div>

        <div className="mb-8">
          <div className="relative w-full max-w-xl mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-muted"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <Button 
              variant="outline" 
              className="text-sm flex items-center gap-1 bg-white"
              onClick={() => setShowSearchOptions(!showSearchOptions)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {showSearchOptions ? "Hide search options" : "Show search options"}
            </Button>
            
            <Button 
              variant="outline" 
              className="text-sm flex items-center gap-1 bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Search
            </Button>
          </div>
          
          {showSearchOptions && (
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-sm font-medium mb-3 text-[#905B40]">Search in:</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${searchFields.name ? 'bg-[#339085] border-[#339085] text-white' : 'border-gray-300'}`} onClick={() => toggleSearchField('name')}>
                    {searchFields.name && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm">Name</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${searchFields.location ? 'bg-[#339085] border-[#339085] text-white' : 'border-gray-300'}`} onClick={() => toggleSearchField('location')}>
                    {searchFields.location && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm">Location</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${searchFields.bio ? 'bg-[#339085] border-[#339085] text-white' : 'border-gray-300'}`} onClick={() => toggleSearchField('bio')}>
                    {searchFields.bio && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm">Bio</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${searchFields.interests ? 'bg-[#339085] border-[#339085] text-white' : 'border-gray-300'}`} onClick={() => toggleSearchField('interests')}>
                    {searchFields.interests && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm">Interests</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${searchFields.skills ? 'bg-[#339085] border-[#339085] text-white' : 'border-gray-300'}`} onClick={() => toggleSearchField('skills')}>
                    {searchFields.skills && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm">Skills</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${searchFields.ventures ? 'bg-[#339085] border-[#339085] text-white' : 'border-gray-300'}`} onClick={() => toggleSearchField('ventures')}>
                    {searchFields.ventures && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm">Ventures</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-5 h-5 border rounded flex items-center justify-center ${searchFields.actionCards ? 'bg-[#339085] border-[#339085] text-white' : 'border-gray-300'}`} onClick={() => toggleSearchField('actionCards')}>
                    {searchFields.actionCards && <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-sm">Action Cards</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse bg-white border-none">
                <div className="flex flex-col items-center pt-6 pb-4">
                  <div className="h-24 w-24 rounded-full bg-muted mb-4"></div>
                  <div className="h-5 w-32 bg-muted rounded mb-1"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
              </Card>
            ))
          ) : (
            filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => navigate(createPageUrl(`MemberProfile?id=${member.id}`))}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow bg-white border-none">
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center py-6">
                      {member.profile_image ? (
                        <img
                          src={member.profile_image}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-24 h-24 rounded-full object-cover mb-4"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-[#EDD6B3] flex items-center justify-center mb-4">
                          <span className="text-xl font-medium text-[#339085]">
                            {`${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`}
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                        {member.first_name} {member.last_name}
                        <div className="flex ml-1">
                          {member.primary_element && <ElementBadge element={member.primary_element} size="sm" showLabel={false} />}
                          {member.secondary_element && <ElementBadge element={member.secondary_element} size="sm" showLabel={false} />}
                        </div>
                      </h3>
                      
                      {member.city && member.country && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          {member.city}, {member.country}
                        </div>
                      )}
                      
                      <div className="mt-2 text-sm text-gray-500">
                        {member.email?.split('@')[0]} @ vibe
                      </div>

                      {/* Skills Section */}
                      {member.skills && member.skills.length > 0 && (
                        <div className="mt-4 w-full px-6">
                          <p className="text-xs font-medium text-gray-700 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.map((skill, index) => (
                              <Badge
                                key={index}
                                className="bg-[#E8E0D8] text-[#6B4F4F] border-[#E8E0D8] font-normal"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interests Section */}
                      {member.interests && member.interests.length > 0 && (
                        <div className="mt-4 w-full px-6">
                          <p className="text-xs font-medium text-gray-700 mb-2">Interests</p>
                          <div className="flex flex-wrap gap-1">
                            {member.interests.map((interest, index) => (
                              <Badge
                                key={index}
                                className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3] font-normal"
                              >
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 w-full flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-8 w-8 p-0 flex items-center justify-center bg-[#F8F3EE]"
                          onClick={(e) => handleMessageClick(e, member)}
                        >
                          <MessageSquare className="h-4 w-4 text-[#905B40]" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        
        {filteredMembers.length === 0 && !isLoading && (
          <div className="text-center p-8 bg-white rounded-lg shadow mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
      {selectedMember && (
        <MessageModal 
          recipientMember={selectedMember} 
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
