
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Pencil, Trash2, Filter, Briefcase, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import AddVentureModal from "@/components/ventures/AddVentureModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Venture } from "@/api/entities";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import RichTextContent from "@/components/shared/RichTextContent";
import { Link } from "react-router-dom";

export default function Ventures() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ventures, setVentures] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [ventureToDelete, setVentureToDelete] = useState(null);
  const navigate = useNavigate();
  const [currentMember, setCurrentMember] = useState(null);

  useEffect(() => {
    loadCurrentMember();
    loadVentures();
  }, []);

  const loadCurrentMember = async () => {
    try {
      const user = await User.me();
      const members = await Member.list();
      const member = members.find(m => 
        m.email?.toLowerCase().trim() === user.email?.toLowerCase().trim()
      );
      setCurrentMember(member);
    } catch (error) {
      console.error("Error loading current member:", error);
    }
  };

  const loadVentures = async () => {
    setIsLoading(true);
    try {
      const venturesData = await Venture.list();
      setVentures(venturesData.map(venture => {
        return {
          ...venture,
          owner: {
            name: venture.owner_name || "Unknown",
            image: venture.owner_image || ""
          },
          isOwner: venture.owner_id === currentMember?.id || venture.created_by === currentMember?.email
        };
      }));
    } catch (error) {
      console.error("Error loading ventures:", error);
      toast({
        variant: "destructive",
        description: "Error loading ventures"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Business Venture':
        return 'bg-[#6B4F4F] text-white';
      case 'Personal Venture':
        return 'bg-[#7ABFAB] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewVenture = (ventureId) => {
    navigate(createPageUrl(`VentureDetail?id=${ventureId}`));
  };

  const handleDeleteVenture = async (ventureId) => {
    try {
      await Venture.delete(ventureId);
      await loadVentures(); // Reload the ventures
      setVentureToDelete(null);
      toast({
        description: "Venture deleted successfully"
      });
      return true;
    } catch (error) {
      console.error("Error deleting venture:", error);
      toast({
        variant: "destructive",
        description: "Error deleting venture"
      });
      return false;
    }
  };

    const filteredVentures = ventures.filter(venture => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            venture.title.toLowerCase().includes(searchTermLower) ||
            venture.description.toLowerCase().includes(searchTermLower) ||
            venture.category.toLowerCase().includes(searchTermLower) ||
            venture.wants_needs.some(need => need.toLowerCase().includes(searchTermLower)) ||
            venture.owner.name.toLowerCase().includes(searchTermLower)
        );
    });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#6B4F4F]">Community Ventures</h1>
        <Button 
          onClick={() => navigate(createPageUrl("VentureEditor"))}
          className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]"
        >
          <Plus className="h-4 w-4" /> 
          New Venture
        </Button>
      </div>

      <div className="mb-8 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search ventures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Show filters
        </Button>
      </div>

      {ventures.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No ventures yet</h3>
          <p className="text-gray-500 mb-6">Be the first to create a venture!</p>
          <Button 
            onClick={() => navigate(createPageUrl("VentureEditor"))}
            className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]"
          >
            <Plus className="h-4 w-4" /> 
            New Venture
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-700">Loading ventures...</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVentures.map((venture) => (
            <Card 
              key={venture.id} 
              className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div 
                className="relative h-48 overflow-hidden"
                onClick={() => handleViewVenture(venture.id)}
              >
                <img
                  src={venture.image}
                  alt={venture.title}
                  className="w-full h-full object-cover"
                />
                {venture.isOwner && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button 
                      variant="ghost"
                      size="icon" 
                      className="h-8 w-8 bg-white/90 hover:bg-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl(`VentureEditor?id=${venture.id}`));
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon" 
                      className="h-8 w-8 bg-white/90 hover:bg-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVentureToDelete(venture);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <CardContent 
                className="p-6"
                onClick={() => handleViewVenture(venture.id)}
              >
                <Badge className={`mb-2 ${getCategoryStyle(venture.category)}`}>
                  {venture.category}
                </Badge>
                
                <h3 className="text-xl font-semibold text-[#6B4F4F] mt-2 mb-1">
                  {venture.title}
                </h3>
                <div className="text-gray-600 mb-4" onClick={(e) => e.stopPropagation()}>
                  <RichTextContent text={venture.description} />
                </div>

              {/* Updated member info section with link to profile */}
              <Link 
                to={venture.owner_id ? createPageUrl(`MemberProfile?id=${venture.owner_id}`) : "#"}
                className={venture.owner_id ? "block" : "pointer-events-none"}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigating to venture detail
                  if (!venture.owner_id) e.preventDefault();
                }}
              >
                <div className="flex items-center gap-3 mb-4 p-3 bg-[#F8F3EE] rounded-lg hover:bg-[#f0e8df] transition-colors">
                  {venture.owner.image ? (
                    <img
                      src={venture.owner.image}
                      alt={venture.owner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#EDD6B3] flex items-center justify-center">
                      <span className="text-sm font-medium text-[#339085]">
                        {venture.owner.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-[#6B4F4F]">
                      {venture.owner.name}
                    </div>
                    <div className="text-xs text-gray-500">Creator</div>
                  </div>
                </div>
              </Link>

                <div>
                  <h4 className="text-sm font-medium text-[#6B4F4F] mb-2">Wants & Needs</h4>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {ventureToDelete && (
        <DeleteConfirmDialog
          title="Delete Venture"
          description="Are you sure you want to delete this venture? This action cannot be undone."
          onClose={() => setVentureToDelete(null)}
          onConfirm={() => handleDeleteVenture(ventureToDelete.id)}
        />
      )}
    </div>
  );
}
