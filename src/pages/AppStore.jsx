
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  Tag,
  Box,
  Star,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";
import { createPageUrl } from "@/utils";
import AddAppModal from "@/components/appStore/AddAppModal";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function AppStore() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [apps, setApps] = useState([]);
  const [appToDelete, setAppToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from the database
      setApps([]);
    } catch (error) {
      console.error("Error loading apps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddApp = async (appData) => {
    try {
      // In a real app, you would create a new app in the database
      // For now, we'll just add it to the local state
      const newApp = {
        id: `app${apps.length + 1}`,
        ...appData,
        rating: 4.5,
        numRatings: 1,
        installs: 0,
        isInstalled: false,
        isOwner: true
      };
      
      setApps([newApp, ...apps]);
      return newApp;
    } catch (error) {
      console.error("Error adding app:", error);
      throw error;
    }
  };

  const handleDeleteApp = async (appId) => {
    try {
      // In a real app, delete from database
      setApps(apps.filter(app => app.id !== appId));
      setAppToDelete(null);
      return true;
    } catch (error) {
      console.error("Error deleting app:", error);
      return false;
    }
  };

  const handleViewApp = (appId) => {
    navigate(createPageUrl(`AppDetail?id=${appId}`));
  };

  // Filter apps based on search term and category
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get installed apps
  const installedApps = apps.filter(app => app.isInstalled);

  // Format number with K suffix for thousands
  const formatNumber = (num) => {
    return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#6B4F4F]">App Store</h1>
        <Button 
          onClick={() => navigate(createPageUrl("AppEditor"))}
          className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]"
        >
          <Plus className="h-4 w-4" /> 
          Submit App
        </Button>
      </div>

      <div className="flex flex-col md:flex-row mb-6 gap-4 items-start md:items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search apps..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="organization">Organization</option>
            <option value="analytics">Analytics</option>
            <option value="productivity">Productivity</option>
            <option value="content">Content</option>
            <option value="members">Members</option>
            <option value="security">Security</option>
            <option value="communication">Communication</option>
            <option value="integrations">Integrations</option>
            <option value="administration">Administration</option>
          </select>
        </div>
      </div>

      {apps.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No apps available yet</h3>
          <p className="text-gray-500 mb-6">Be the first to submit an app!</p>
          <Button 
            onClick={() => navigate(createPageUrl("AppEditor"))}
            className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]"
          >
            <Plus className="h-4 w-4" /> 
            Submit App
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <Card 
            key={app.id}
            className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#F8F3EE] rounded-lg flex items-center justify-center text-2xl">
                  {app.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#6B4F4F]">{app.name}</h3>
                  <p className="text-gray-600 text-sm">{app.description}</p>
                </div>
              </div>

              {/* Added member info section */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#F8F3EE] rounded-lg">
                {app.owner.image ? (
                  <img
                    src={app.owner.image}
                    alt={app.owner.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#EDD6B3] flex items-center justify-center">
                    <span className="text-sm font-medium text-[#339085]">
                      {app.owner.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-[#6B4F4F]">
                    {app.owner.name}
                  </div>
                  <div className="text-xs text-gray-500">Developer</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AppCard({ app, formatNumber, onView, onDelete }) {
  const handleClick = () => {
    if (onView) {
      onView(app.id);
    }
  };

  // For demo purposes only
  const AppIcon = () => <div className={`w-6 h-6 ${app.iconColor}`}>●</div>;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${app.iconBg}`}>
            <AppIcon />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="fill-amber-400 stroke-amber-400 h-3 w-3" />
              <span>{app.rating}</span>
              <span className="text-gray-400">({formatNumber(app.numRatings)})</span>
            </Badge>
            
            {app.isOwner && (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(app.id + '?edit=true');
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{app.name}</CardTitle>
        <Badge className="mt-1 bg-gray-100 text-gray-800">
          <Tag className="mr-1 h-3 w-3" />
          {app.category.charAt(0).toUpperCase() + app.category.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{app.description}</p>
        <p className="text-xs text-gray-500">{formatNumber(app.installs)} installs</p>
      </CardContent>
      <CardFooter className="pt-0">
        {app.isInstalled ? (
          <Button variant="outline" className="w-full" disabled>
            Installed
          </Button>
        ) : (
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Download className="mr-2 h-4 w-4" /> Install
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
