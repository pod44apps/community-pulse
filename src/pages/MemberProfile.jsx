
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Member } from "@/api/entities";
import { User } from "@/api/entities";
import { Venture } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Layers
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import ElementBadge from "@/components/elements/ElementBadge";
import RichTextContent from "@/components/shared/RichTextContent";

export default function MemberProfile() {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [activeTab, setActiveTab] = useState("ventures");

  useEffect(() => {
    loadMemberProfile();
  }, []);

  const loadMemberProfile = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const memberId = urlParams.get('id');
      
      if (!memberId) {
        navigate(createPageUrl("Members"));
        return;
      }

      const members = await Member.list();
      const memberData = members.find(m => m.id === memberId);
      
      if (!memberData || memberData.status !== 'approved') {
        navigate(createPageUrl("Members"));
        return;
      }

      // Check if current user
      try {
        const currentUser = await User.me();
        if (currentUser && currentUser.email === memberData.email) {
          setIsCurrentUser(true);
        }
      } catch (error) {
        console.error("Error checking current user:", error);
      }

      // Load member's ventures
      try {
        const allVentures = await Venture.list();
        const memberVentures = allVentures.filter(v => 
          v.owner_id === memberId || v.created_by === memberData.email
        );
        
        // Initialize related items with the actual ventures
        const relatedItems = {
          ventures: memberVentures,
          actionCards: []  // You can load action cards similarly if needed
        };

        // Add registration date if not present
        if (!memberData.created_date) {
          memberData.created_date = new Date().toISOString();
        }

        setMember({ ...memberData, relatedItems });
      } catch (error) {
        console.error("Error loading ventures:", error);
      }

    } catch (error) {
      console.error("Error loading member profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Business':
        return 'bg-[#6B4F4F] text-white';
      case 'Personal':
        return 'bg-[#7ABFAB] text-white';
      case 'Social Impact':
        return 'bg-[#D2691E] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add this helper function for venture category styling
  const getVentureCategoryStyle = (category) => {
    switch (category) {
      case 'Business':
        return 'bg-[#6B4F4F] text-white';
      case 'Personal':
        return 'bg-[#7ABFAB] text-white';
      case 'Social Impact':
        return 'bg-[#D2691E] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-48 bg-gradient-to-r from-teal-500 via-yellow-400 to-orange-500"></div>
        <div className="max-w-4xl mx-auto -mt-20 px-6">
          <div className="animate-pulse">
            <div className="h-40 w-40 rounded-full bg-muted mx-auto"></div>
            <div className="mt-4 text-center space-y-3">
              <div className="h-8 w-48 bg-muted rounded mx-auto"></div>
              <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-teal-500 via-yellow-400 to-orange-500"></div>
      
      <div className="max-w-5xl mx-auto -mt-20 px-6">
        <Button 
          variant="ghost" 
          className="mb-6 bg-white/90 hover:bg-white"
          onClick={() => navigate(createPageUrl("Members"))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Members
        </Button>

        {/* Profile header with profile picture */}
        
        <Card className="mb-6 overflow-hidden bg-white border-none shadow-sm">
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image Section */}
            {member.profile_image ? (
              <img 
                src={member.profile_image}
                alt={`${member.first_name} ${member.last_name}`}
                className="w-40 h-40 rounded-full object-cover border-4 border-white"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-[#EDD6B3] flex items-center justify-center border-4 border-white">
                <span className="text-4xl font-medium text-[#339085]">
                  {`${member.first_name?.[0] || ""}${member.last_name?.[0] || ""}`}
                </span>
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 justify-center md:justify-start">
                {member.first_name} {member.last_name}
                {/* Add the elements here */}
                <div className="flex gap-1 ml-2">
                  {member.primary_element && <ElementBadge element={member.primary_element} size="sm" showLabel={false} />}
                  {member.secondary_element && <ElementBadge element={member.secondary_element} size="sm" showLabel={false} />}
                </div>
                {isCurrentUser && (
                  <Badge className="ml-2 bg-[#339085] text-white">You</Badge>
                )}
              </h2>
              <p className="text-gray-600 mt-1">{member.email?.split('@')[0]} @ vibe</p>
              
              
              {/* Add the elements again with labels if they exist */}
              {(member.primary_element || member.secondary_element) && (
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  {member.primary_element && <ElementBadge element={member.primary_element} />}
                  {member.secondary_element && <ElementBadge element={member.secondary_element} />}
                </div>
              )}
            </div>
          </div>
        </Card>
        

        {/* Contact information card */}
        <Card className="mb-8 bg-white border-none">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-[#6B4F4F] mb-4 flex items-center">
              <span className="text-xl mr-2">👤</span> Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#339085] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{member.email}</p>
                  </div>
                </div>
                
                {member.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#339085] mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{member.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {(member.city || member.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#339085] mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900">{[member.city, member.country].filter(Boolean).join(", ")}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#339085] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="text-gray-900">{format(new Date(member.created_date), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>

            {member.bio && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-1">Bio</p>
                <p className="text-gray-900">{member.bio}</p>
              </div>
            )}
            
            {/* Skills and Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {member.skills && member.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, index) => (
                      <Badge 
                        key={index}
                        className="bg-[#E8E0D8] text-[#6B4F4F] border-[#E8E0D8]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {member.interests && member.interests.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {member.interests.map((interest, index) => (
                      <Badge 
                        key={index}
                        className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3]"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Ventures and ActionCards */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
                activeTab === "ventures"
                  ? "border-b-2 border-[#8B4513] text-[#8B4513]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("ventures")}
            >
              <Briefcase className="w-4 h-4" />
              Ventures
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm flex items-center gap-2 ${
                activeTab === "action_cards"
                  ? "border-b-2 border-[#8B4513] text-[#8B4513]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("action_cards")}
            >
              <Layers className="w-4 h-4" />
              Action Cards
            </button>
          </div>
        </div>

        {/* Ventures Content */}
        {activeTab === "ventures" && (
          <div className="mb-12">
            {member.relatedItems.ventures.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No ventures yet</h3>
                <p className="text-gray-500">This member hasn't created any ventures yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {member.relatedItems.ventures.map((venture) => (
                  <Card 
                    key={venture.id}
                    className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(createPageUrl(`VentureDetail?id=${venture.id}`))}
                  >
                    <div className="h-40 overflow-hidden">
                      <img
                        src={venture.image}
                        alt={venture.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge className={getVentureCategoryStyle(venture.category)}>
                        {venture.category}
                      </Badge>
                      <h3 className="font-semibold text-[#6B4F4F] mt-2 mb-2">{venture.title}</h3>
                      <div className="text-gray-500 text-sm mb-3" onClick={(e) => e.stopPropagation()}>
                        <RichTextContent text={venture.description} />
                      </div>
                      
                      {venture.wants_needs && venture.wants_needs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {venture.wants_needs.map((need, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="bg-[#F8F3EE] text-[#6B4F4F] border-[#E8E0D8]"
                            >
                              {need}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Cards Content */}
        {activeTab === "action_cards" && (
          <div className="mb-12">
            {member.relatedItems.actionCards.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No action cards yet</h3>
                <p className="text-gray-500">This member hasn't created any action cards yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {member.relatedItems.actionCards.map((card) => (
                  <Card 
                    key={card.id}
                    className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(createPageUrl(`ActionCardDetail?id=${card.id}`))}
                  >
                    <div className="h-40 overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge className={getCategoryStyle(card.category)} >
                        {card.category}
                      </Badge>
                      <h3 className="font-semibold text-[#6B4F4F]">{card.title}</h3>
                      <p className="text-gray-500 text-sm">{card.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Profile button (if viewing own profile) */}
        {isCurrentUser && (
          <div className="flex justify-center mb-12">
            <Button 
              onClick={() => navigate(createPageUrl("Profile"))}
              className="bg-[#8B4513] hover:bg-[#6B3B0D]"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
