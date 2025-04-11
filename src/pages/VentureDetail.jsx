
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Venture } from "@/api/entities";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import RichTextContent from "@/components/shared/RichTextContent";

export default function VentureDetail() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [venture, setVenture] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadVentureDetails();
  }, []);

  const checkIfOwner = async (venture) => {
    try {
      const user = await User.me();
      const members = await Member.list();
      const currentMember = members.find(m => 
        m.email?.toLowerCase().trim() === user.email?.toLowerCase().trim()
      );
      
      if (currentMember && venture) {
        // Check if current member is the owner
        setIsOwner(
          venture.owner_id === currentMember.id || 
          venture.created_by === user.email
        );
      }
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
  };

  const loadVentureDetails = async () => {
    setIsLoading(true);
    try {
      // Get the venture ID from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const ventureId = urlParams.get('id');
      
      if (!ventureId) {
        toast({
          variant: "destructive",
          description: "No venture ID provided"
        });
        navigate(createPageUrl("Ventures"));
        return;
      }

      // Fetch the venture data
      const ventureResult = await Venture.filter({ id: ventureId });
      if (ventureResult && ventureResult.length > 0) {
        setVenture(ventureResult[0]);
        await checkIfOwner(ventureResult[0]);
      } else {
        toast({
          variant: "destructive",
          description: "Venture not found"
        });
        navigate(createPageUrl("Ventures"));
      }
    } catch (error) {
      console.error("Error loading venture:", error);
      toast({
        variant: "destructive",
        description: "Error loading venture details"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVenture = async () => {
    try {
      await Venture.delete(venture.id);
      toast({
        description: "Venture deleted successfully"
      });
      navigate(createPageUrl("Ventures"));
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B4F4F]" />
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700">Venture not found</h3>
          <Button 
            onClick={() => navigate(createPageUrl("Ventures"))}
            className="mt-4"
          >
            Return to Ventures
          </Button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={() => navigate(createPageUrl("Ventures"))}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ventures
        </Button>
        
        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate(createPageUrl(`VentureEditor?id=${venture.id}`))}
            >
              <Pencil className="h-4 w-4" />
              Edit Venture
            </Button>
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden border-none shadow-sm">
        <div className="h-64 relative">
          <img 
            src={venture.image} 
            alt={venture.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <CardContent className="p-6">
          <div className="mb-6">
            <Badge className={`mb-3 ${getCategoryStyle(venture.category)}`}>
              {venture.category}
            </Badge>
            <h1 className="text-3xl font-bold text-[#6B4F4F] mb-4">{venture.title}</h1>
            <div className="text-gray-600">
              <RichTextContent text={venture.description} />
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#6B4F4F] mb-3">Wants & Needs</h2>
            <div className="flex flex-wrap gap-2">
              {venture.wants_needs && venture.wants_needs.map((need, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="bg-[#F8F3EE] text-[#6B4F4F] border-[#E8E0D8] px-3 py-1"
                >
                  {need}
                </Badge>
              ))}
              {(!venture.wants_needs || venture.wants_needs.length === 0) && (
                <p className="text-gray-500">No wants or needs specified</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-[#6B4F4F] mb-3">Venture Owner</h2>
            <Link 
              to={venture.owner_id ? createPageUrl(`MemberProfile?id=${venture.owner_id}`) : "#"} 
              className={venture.owner_id ? "cursor-pointer" : "cursor-default"}
              onClick={(e) => !venture.owner_id && e.preventDefault()}
            >
              <div className="flex items-center gap-4 p-4 bg-[#F8F3EE] rounded-lg hover:bg-[#f0e8df] transition-colors">
                {venture.owner_image ? (
                  <img
                    src={venture.owner_image}
                    alt={venture.owner_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#EDD6B3] flex items-center justify-center">
                    <span className="text-lg font-medium text-[#339085]">
                      {(venture.owner_name || "?").charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold text-[#6B4F4F]">
                    {venture.owner_name || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">Venture Creator</div>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-8 flex justify-end">
            {isOwner ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Ventures"))}
                >
                  Back to Ventures
                </Button>
                <Button
                  variant="default"
                  className="bg-[#339085] hover:bg-[#2A7268]"
                  onClick={() => navigate(createPageUrl(`VentureEditor?id=${venture.id}`))}
                >
                  Edit Venture
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Ventures"))}
              >
                Back to Ventures
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showDeleteDialog && (
        <DeleteConfirmDialog
          title="Delete Venture"
          description="Are you sure you want to delete this venture? This action cannot be undone."
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteVenture}
        />
      )}
    </div>
  );
}
