
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsEntity } from "@/api/entities";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";
import { Check, Palette, Save, Loader2, User as UserIcon, Building, Shield, RefreshCw } from "lucide-react";
import ColorEditor from "@/components/settings/ColorEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import ThemeSelector from "@/components/settings/ThemeSelector";

const COLOR_THEMES = {
  'purple-sage': {
    name: 'Purple Sage',
    colors: {
      primary: '#339085',
      secondary: '#7ABFAB',
      accent: '#6B4F4F',
      background: '#EDEAE4',
      muted: '#EDD6B3',
      foreground: '#905B40',
      highlight: '#CC7A2F',
      neutral: '#C7A671',
      sectionBg: '#FFFFFF'
    }
  },
  'ocean-blue': {
    name: 'Ocean Blue',
    colors: {
      primary: '#2B7B8C',
      secondary: '#60A5C2',
      accent: '#4A6670',
      background: '#EEF2F5',
      muted: '#D3E0E6',
      foreground: '#2F4858',
      highlight: '#E67E22',
      neutral: '#94A7B5',
      sectionBg: '#FFFFFF'
    }
  },
  'forest-green': {
    name: 'Forest Green',
    colors: {
      primary: '#2D6A4F',
      secondary: '#74C69D',
      accent: '#40916C',
      background: '#F0F7F4',
      muted: '#B7E4C7',
      foreground: '#1B4332',
      highlight: '#D64933',
      neutral: '#95D5B2',
      sectionBg: '#FFFFFF'
    }
  },
  'autumn-amber': {
    name: 'Autumn Amber',
    colors: {
      primary: '#B65F33',
      secondary: '#E6A168',
      accent: '#8B4C32',
      background: '#FDF6ED',
      muted: '#F8D5A8',
      foreground: '#703E26',
      highlight: '#D95204',
      neutral: '#DEB78B',
      sectionBg: '#FFFFFF'
    }
  },
  'natural-beige': {
    name: 'Natural Beige',
    colors: {
      primary: '#8C7355',
      secondary: '#BFA98F',
      accent: '#6B5840',
      background: '#F7F3ED',
      muted: '#E8DCCC',
      foreground: '#504633',
      highlight: '#BA704F',
      neutral: '#AD9B82',
      sectionBg: '#FFFFFF'
    }
  },
  'wonderland': {
    name: 'Wonderland',
    colors: {
      primary: '#339085',
      secondary: '#7ABFAB',
      accent: '#6B4F4F',
      background: '#EDEAE4',
      muted: '#EDD6B3',
      foreground: '#905B40',
      highlight: '#CC7A2F',
      neutral: '#C7A671',
      sectionBg: '#FFFFFF'
    }
  }
};

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('purple-sage');
  const [members, setMembers] = useState([]);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [activePage, setActivePage] = useState("branding");

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (selectedTheme) {
      applyTheme(selectedTheme);
    }
  }, [selectedTheme]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (user.role !== 'admin') {
        toast({
          variant: "destructive",
          description: "Only administrators can access settings"
        });
        return;
      }

      // Load settings
      const settingsList = await SettingsEntity.list();
      if (settingsList.length > 0) {
        setSettings(settingsList[0]);
        setSelectedTheme(settingsList[0].color_theme || 'purple-sage');
        if (settingsList[0].custom_colors) {
          applyCustomColors(settingsList[0].custom_colors);
        }
      } else {
        // Default settings
        setSettings({
          app_name: "Community Hub",
          app_logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7b5790_communityapplogo.png",
          tag_line: "Let's make an impact today!"
        });
      }

      // Load members for member management tab
      const membersList = await Member.list();
      setMembers(membersList);

      // Find the member and update their admin status
      const vibeWonderlandMember = membersList.find(m => m.email === "pod44apps@gmail.com");
      if (vibeWonderlandMember) {
        await Member.update(vibeWonderlandMember.id, {
          ...vibeWonderlandMember,
          is_admin: true
        });
        
        toast({
          description: "Admin privileges granted to Vibe Wonderland AI POS"
        });
      } else {
        toast({
          variant: "destructive",
          description: "Member not found"
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        variant: "destructive",
        description: "Error loading settings"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyTheme = (themeKey) => {
    const theme = COLOR_THEMES[themeKey];
    if (!theme) return;
    
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
      
      // Set derived colors
      if (key === 'primary') {
        root.style.setProperty('--primary-hover', adjustColor(value, -20));
      }
      if (key === 'accent') {
        root.style.setProperty('--accent-hover', adjustColor(value, -20));
      }
      if (key === 'muted') {
        root.style.setProperty('--muted-hover', adjustColor(value, -10));
      }
      if (key === 'sectionBg') {
        root.style.setProperty('--card-hover', adjustColor(value, -5));
      }
    });

    // Save theme to settings
    if (settings?.id) {
      const updatedSettings = {
        ...settings,
        color_theme: themeKey,
        custom_colors: theme.colors
      };
      
      setSettings(updatedSettings);
      SettingsEntity.update(settings.id, updatedSettings)
        .then(() => {
          toast({
            description: "Theme applied successfully"
          });
        })
        .catch(error => {
          console.error("Error saving theme:", error);
          toast({
            variant: "destructive",
            description: "Error saving theme"
          });
        });
    }
  };

  const applyCustomColors = (customColors) => {
    if (!customColors) return;

    const root = document.documentElement;
    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply derived colors
    if (customColors.primary) {
      root.style.setProperty('--primary-hover', adjustColor(customColors.primary, -20));
    }
    if (customColors.accent) {
      root.style.setProperty('--accent-hover', adjustColor(customColors.accent, -20));
    }
    if (customColors.muted) {
      root.style.setProperty('--muted-hover', adjustColor(customColors.muted, -10));
    }
    if (customColors.sectionBg) {
      root.style.setProperty('--card-hover', adjustColor(customColors.sectionBg, -5));
    }
  };
  
  // Helper to darken/lighten colors for hover states
  const adjustColor = (color, amount) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => 
      ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        color_theme: selectedTheme,
        custom_colors: settings.custom_colors || COLOR_THEMES[selectedTheme].colors
      };

      if (settings?.id) {
        await SettingsEntity.update(settings.id, updatedSettings);
      } else {
        await SettingsEntity.create(updatedSettings);
      }

      toast({
        description: "Settings saved successfully"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        description: "Error saving settings"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMemberStatusChange = async (memberId, newStatus) => {
    try {
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, status: newStatus } : member
      ));
      
      await Member.update(memberId, { status: newStatus });
      
      toast({
        description: `Member status updated to ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating member status:", error);
      await loadSettings();
      toast({
        variant: "destructive",
        description: "Failed to update member status"
      });
    }
  };

  const handleMemberRoleChange = async (memberId, email, isAdmin) => {
    try {
      setMembers(members.map(member => 
        member.id === memberId ? { ...member, is_admin: isAdmin } : member
      ));
      
      await Member.update(memberId, { is_admin: isAdmin });
      
      toast({
        description: `User role updated to ${isAdmin ? 'Admin' : 'User'}`
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      await loadSettings();
      toast({
        variant: "destructive",
        description: "Failed to update user role"
      });
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await Member.delete(memberId);
      
      // Update local state
      setMembers(members.filter(member => member.id !== memberId));
      
      toast({
        description: "Member deleted successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        variant: "destructive",
        description: "Failed to delete member"
      });
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-[var(--primary)]">Settings</h1>
      
      <Tabs value={activePage} onValueChange={setActivePage} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="members">Member Management</TabsTrigger>
          <TabsTrigger value="invites">User Invites</TabsTrigger>
        </TabsList>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle>Branding Settings</CardTitle>
              </div>
              <CardDescription>
                Customize the name, logo, and tagline of your community hub
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="app_name">App Name</Label>
                    <Input
                      id="app_name"
                      value={settings?.app_name || ''}
                      onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app_logo">Logo URL</Label>
                    <Input
                      id="app_logo"
                      value={settings?.app_logo || ''}
                      onChange={(e) => setSettings({ ...settings, app_logo: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">Enter a direct link to your logo image</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tag_line">Tagline</Label>
                    <Textarea
                      id="tag_line"
                      value={settings?.tag_line || ''}
                      onChange={(e) => setSettings({ ...settings, tag_line: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="md:col-span-1">
                  <div className="bg-[var(--background)] p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-4">Preview</h3>
                    <div className="bg-[var(--card)] p-4 rounded border">
                      <div className="flex items-center gap-3">
                        <img 
                          src={settings?.app_logo} 
                          alt="Logo Preview"
                          className="h-8 w-8 object-contain"
                        />
                        <div>
                          <p className="font-bold text-[var(--primary)]">{settings?.app_name}</p>
                          <p className="text-xs text-gray-600">{settings?.tag_line}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle>App Appearance</CardTitle>
              </div>
              <CardDescription>
                Choose a color theme for your community hub
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <ThemeSelector 
                selectedTheme={settings?.color_theme || 'purple-sage'} 
                onThemeSelect={(theme) => applyTheme(theme)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Member Management */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle>Member Management</CardTitle>
              </div>
              <CardDescription>
                Manage community members, their roles and approval status
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {member.profile_image ? (
                              <img 
                                src={member.profile_image} 
                                alt={`${member.first_name} ${member.last_name}`}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                                <span className="text-xs text-[var(--foreground)]">
                                  {member.first_name?.[0] || member.email?.[0] || "?"}
                                </span>
                              </div>
                            )}
                            <span>
                              {member.first_name} {member.last_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 flex gap-2 items-center">
                                <Badge 
                                  className={
                                    member.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                    member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }
                                >
                                  {member.status}
                                </Badge>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleMemberStatusChange(member.id, 'approved')}>
                                Approved
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMemberStatusChange(member.id, 'pending')}>
                                Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMemberStatusChange(member.id, 'rejected')}>
                                Rejected
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 flex gap-2 items-center">
                                <Badge 
                                  className="bg-blue-100 text-blue-800"
                                >
                                  {member.is_admin ? 'Admin' : 'User'}
                                </Badge>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleMemberRoleChange(member.id, member.email, true)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMemberRoleChange(member.id, member.email, false)}>
                                <UserIcon className="mr-2 h-4 w-4" />
                                User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setMemberToDelete(member)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Invites */}
        <TabsContent value="invites">
          <Card>
            <CardHeader>
              <CardTitle>User Invites</CardTitle>
              <CardDescription>
                Invite new users to your community hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>User invitation functionality is coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {memberToDelete && (
        <DeleteConfirmDialog
          title="Delete Member"
          description={`Are you sure you want to delete ${memberToDelete.first_name} ${memberToDelete.last_name}? This action cannot be undone.`}
          onClose={() => setMemberToDelete(null)}
          onConfirm={() => handleDeleteMember(memberToDelete.id)}
        />
      )}
    </div>
  );
}
