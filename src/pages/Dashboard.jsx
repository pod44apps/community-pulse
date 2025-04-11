import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/api/entities";
import { User } from "@/api/entities";
import { Venture } from "@/api/entities";
import { ActionCard } from "@/api/entities";
import RichTextContent from "@/components/shared/RichTextContent";
import { 
  Users, 
  Briefcase, 
  Box, 
  Layers, 
  ChevronRight, 
  BookOpen, 
  Hash,
  MessageSquare,
  Loader2
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    ventures: 0,
    actionCards: 0,
    communityApps: 0
  });
  const [spotlightVentures, setSpotlightVentures] = useState([]);
  const [featuredCards, setFeaturedCards] = useState([]);
  const [topInterests, setTopInterests] = useState([]);
  const [topSkills, setTopSkills] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get member data
      const members = await Member.list();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newMembers = members.filter(
        m => new Date(m.created_date) > thirtyDaysAgo
      ).length;

      // Get ventures
      const ventures = await Venture.list();
      
      // Get action cards
      const actionCards = await ActionCard.list();

      setStats({
        totalMembers: members.length,
        newMembers,
        ventures: ventures.length,
        actionCards: actionCards.length,
        communityApps: 3 // Keep this for now as apps feature is not implemented yet
      });

      // Set spotlight ventures (most recent 3)
      setSpotlightVentures(
        ventures
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 3)
      );

      // Set featured action cards (most recent 3)
      setFeaturedCards(
        actionCards
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 3)
      );

      // Extract top interests and skills from members
      const interestsCount = {};
      const skillsCount = {};

      members.forEach(member => {
        if (member.interests && Array.isArray(member.interests)) {
          member.interests.forEach(interest => {
            interestsCount[interest] = (interestsCount[interest] || 0) + 1;
          });
        }
        if (member.skills && Array.isArray(member.skills)) {
          member.skills.forEach(skill => {
            skillsCount[skill] = (skillsCount[skill] || 0) + 1;
          });
        }
      });

      // Convert to arrays and sort by count
      const sortedInterests = Object.entries(interestsCount)
        .sort(([,a], [,b]) => b - a)
        .map(([name, count]) => ({ name, count }));

      const sortedSkills = Object.entries(skillsCount)
        .sort(([,a], [,b]) => b - a)
        .map(([name, count]) => ({ name, count }));

      setTopInterests(sortedInterests.slice(0, 5)); // Top 5 interests
      setTopSkills(sortedSkills.slice(0, 5)); // Top 5 skills

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Knowledge':
        return 'bg-[#7ABFAB] text-white';
      case 'Location':
        return 'bg-[#CC7A2F] text-white';
      case 'Talent Sharing':
        return 'bg-[#6B4F4F] text-white';
      case 'Business':
        return 'bg-[#6B4F4F] text-white';
      case 'Personal':
        return 'bg-[#7ABFAB] text-white';
      case 'Social Impact':
        return 'bg-[#CC7A2F] text-white';
      default:
        return 'bg-[#C7A671] text-white';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#905B40] mb-2">Community Hub</h1>
            {currentUser && (
              <p className="text-[#905B40]">Awesome to have you here, {currentUser.full_name}!</p>
            )}
          </div>

          {/* Stats Grid - Styled like the screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Total Members</h3>
                    <p className="text-4xl font-bold text-[#905B40]">{stats.totalMembers}</p>
                    <p className="text-xs text-green-600 mt-1">+{stats.newMembers} new in last 30 days</p>
                  </div>
                  <div className="rounded-full bg-[#EDF7F6] p-3">
                    <Users className="h-6 w-6 text-[#339085]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Ventures</h3>
                    <p className="text-4xl font-bold text-[#905B40]">{stats.ventures}</p>
                    <p className="text-xs text-gray-500 mt-1">Collaborative projects and initiatives</p>
                  </div>
                  <div className="rounded-full bg-[#EDF7F6] p-3">
                    <Briefcase className="h-6 w-6 text-[#339085]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Action Cards</h3>
                    <p className="text-4xl font-bold text-[#905B40]">{stats.actionCards}</p>
                    <p className="text-xs text-gray-500 mt-1">Resources and services shared</p>
                  </div>
                  <div className="rounded-full bg-[#EDF7F6] p-3">
                    <Layers className="h-6 w-6 text-[#339085]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">Community Apps</h3>
                    <p className="text-4xl font-bold text-[#905B40]">{stats.communityApps}</p>
                    <p className="text-xs text-gray-500 mt-1">Custom tools and applications</p>
                  </div>
                  <div className="rounded-full bg-[#EDF7F6] p-3">
                    <Box className="h-6 w-6 text-[#339085]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Spotlight Ventures */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#905B40] flex items-center gap-2">
                <span className="text-2xl">✨</span> Spotlight Ventures
              </h2>
              <Link 
                to={createPageUrl("Ventures")} 
                className="text-[#339085] hover:text-[#297970] flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {spotlightVentures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {spotlightVentures.map((venture) => (
                  <Card 
                    key={venture.id}
                    className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link to={createPageUrl(`VentureDetail?id=${venture.id}`)}>
                      <div className="h-48 overflow-hidden">
                        <img
                          src={venture.image || "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHN1c3RhaW5hYmxlfGVufDB8fDB8fHww"}
                          alt={venture.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <Badge className={getCategoryStyle(venture.category)}>
                          {venture.category}
                        </Badge>
                        <h3 className="text-xl font-semibold text-[#6B4F4F] mt-2 mb-1">
                          {venture.title}
                        </h3>
                        <div className="text-gray-600 line-clamp-2 mb-3">
                          <RichTextContent text={venture.description} />
                        </div>
                        
                        {venture.owner_name && (
                          <div className="flex items-center gap-2 mt-2">
                            {venture.owner_image ? (
                              <img 
                                src={venture.owner_image} 
                                alt={venture.owner_name}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-[#EDD6B3] flex items-center justify-center">
                                <span className="text-xs text-[#905B40]">
                                  {venture.owner_name?.[0] || "?"}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-500">{venture.owner_name}</span>
                          </div>
                        )}
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white border-none shadow-sm p-12 text-center">
                <div className="flex flex-col items-center">
                  <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No ventures yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Create your first venture to showcase your projects to the community.
                  </p>
                  <Link to={createPageUrl("VentureEditor")}>
                    <Button className="bg-[#339085] hover:bg-[#297970]">
                      Create a Venture
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Top Interests/Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-[#339085]" />
                  <h3 className="text-lg font-semibold text-[#905B40]">Top Interests</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">What community members are passionate about</p>
                
                {topInterests.length > 0 ? (
                  <div className="space-y-3">
                    {topInterests.map((interest, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#F8ECD9] text-[#905B40] border-[#F0DEC3]">
                            {interest.name}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{interest.count} members</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No interests data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-5 w-5 text-[#339085]" />
                  <h3 className="text-lg font-semibold text-[#905B40]">Top Skills</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Expertise available in our community</p>
                
                {topSkills.length > 0 ? (
                  <div className="space-y-3">
                    {topSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#E8E0D8] text-[#6B4F4F] border-[#E8E0D8]">
                            {skill.name}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{skill.count} members</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No skills data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}