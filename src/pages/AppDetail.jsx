import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Download, Star } from "lucide-react";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import EditAppModal from "@/components/appStore/EditAppModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function AppDetail() {
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadAppDetails();
  }, []);
  
  const loadAppDetails = async () => {
    setIsLoading(true);
    try {
      // Get the app ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const appId = urlParams.get('id');
      
      if (!appId) {
        navigate(createPageUrl("AppStore"));
        return;
      }
      
      // In a real app, fetch the specific app
      // For now, use sample data
      const sampleApp = {
        id: appId,
        name: "Event Scheduler",
        description: "Easily schedule and manage community events, send invitations, and track attendance. This app helps you organize events of any size, from small meetups to large conferences.",
        category: "organization",
        rating: 4.7,
        numRatings: 124,
        installs: 1250,
        isInstalled: true,
        icon: "https://example.com/icon.png",
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
        screenshots: [
          "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=1000",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000"
        ],
        developer: {
          id: "user123",
          name: "Ronen Gafni"
        },
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      };
      
      setApp(sampleApp);
      
      // Check if current user is the owner/developer
      const currentUser = await User.me();
      if (currentUser) {
        // In a real app, compare with the app developer ID
        // For demo, assume the user is the owner
        setIsOwner(true);
      }
    } catch (error) {
      console.error("Error loading app details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditApp = async (updatedData) => {
    try {
      // In a real app, you would update the app in the database
      // For now, just update the local state
      setApp({
        ...app,
        ...updatedData,
        updated_date: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error("Error updating app:", error);
      return false;
    }
  };
  
  const handleDeleteApp = async () => {
    try {
      // In a real app, you would delete the app from the database
      // For now, just navigate back to the app store
      navigate(createPageUrl("AppStore"));
      return true;
    } catch (error) {
      console.error("Error deleting app:", error);
      return false;
    }
  };
  
  // Format number with K suffix for thousands
  const formatNumber = (num) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num;
  };
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#8B4513] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#8B4513]">Loading app details...</p>
      </div>
    );
  }
  
  if (!app) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#8B4513] mb-4">App not found</p>
        <Button 
          onClick={() => navigate(createPageUrl("AppStore"))}
          className="bg-[#8B4513] hover:bg-[#5D2E0D]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to App Store
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(createPageUrl("AppStore"))}
          className="text-[#8B4513]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to App Store
        </Button>
        
        {isOwner && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditModal(true)}
              className="text-[#8B4513]"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <Card className="overflow-hidden border-none bg-white shadow-md mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-5 rounded-lg ${app.iconBg}`}>
              <div className={`h-10 w-10 ${app.iconColor} flex items-center justify-center text-2xl font-bold`}>
                {app.name.charAt(0)}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-[#6B4F4F]">{app.name}</h1>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="fill-amber-400 stroke-amber-400 h-3 w-3" />
                  <span>{app.rating}</span>
                  <span className="text-gray-400">({formatNumber(app.numRatings)})</span>
                </Badge>
              </div>
              <Badge className="mt-1 bg-gray-100 text-gray-800">
                {app.category.charAt(0).toUpperCase() + app.category.slice(1)}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">
                {formatNumber(app.installs)} installs • By {app.developer.name}
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">{app.description}</p>
          
          <Button 
            className="w-full bg-[#8B4513] hover:bg-[#5D2E0D]" 
            disabled={app.isInstalled}
          >
            {app.isInstalled ? (
              "Installed"
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Install
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#6B4F4F] mb-4">Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {app.screenshots.map((screenshot, index) => (
              <img 
                key={index}
                src={screenshot}
                alt={`${app.name} screenshot ${index + 1}`}
                className="rounded-lg shadow-sm object-cover h-48 w-full"
              />
            ))}
          </div>
        </div>
      )}
      
      {showEditModal && (
        <EditAppModal
          app={app}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleEditApp}
        />
      )}
      
      {showDeleteDialog && (
        <DeleteConfirmDialog
          title="Delete App"
          description="Are you sure you want to delete this app? This action cannot be undone."
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteApp}
        />
      )}
    </div>
  );
}