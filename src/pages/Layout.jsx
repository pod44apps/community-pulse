

import { createPageUrl } from "@/utils"; 
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Menu, X, Briefcase, Layers, Box, MessageSquare, Sparkles, Settings as SettingsIcon, Shield, LogOut, User as UserIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";  
import { toast } from "@/components/ui/use-toast";
import { Member } from "@/api/entities";
import { Settings } from "@/api/entities";
import { Message } from "@/api/entities";
import ThemeProvider from "@/components/ui/theme-provider";

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const welcomeMessages = [
  "Welcome back!",
  "Great to see you!",
  "Hello there!",
  "What's up?",
  "Ready to collaborate?",
  "Let's make an impact today!",
  "Community awaits you!",
  "Awesome to have you here!",
  "Let's build together!",
  "Ready for action?"
];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate(); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [pendingMember, setPendingMember] = useState(false);
  const userInitializedRef = useRef(false);
  const [memberId, setMemberId] = useState(null);

  const [appSettings, setAppSettings] = useState({
    app_name: "Community Hub",
    app_logo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7b5790_communityapplogo.png",
    tag_line: "Let's make an impact today!"
  });

  useEffect(() => {
    let mounted = true;
    
    async function init() {
      try {
        // Load app settings
        const settingsList = await Settings.list();
        if (settingsList.length > 0 && mounted) {
          setAppSettings(settingsList[0]);
          
          // Apply theme colors from the uploaded color scheme
          applyNewColorTheme();
        }
      } catch (error) {
        console.error("Error loading app settings:", error);
      }
      
      if (!userInitializedRef.current) {
        userInitializedRef.current = true;
        await loadCurrentUser();
      }
    }
    
    init();
    return () => mounted = false;
  }, []);

  const applyNewColorTheme = () => {
    const root = document.documentElement;
    
    // Apply new color scheme from image
    root.style.setProperty('--primary', '#339085');
    root.style.setProperty('--secondary', '#7ABFAB');
    root.style.setProperty('--accent', '#6B4F4F');
    root.style.setProperty('--background', '#EDEAE4');
    root.style.setProperty('--muted', '#EDD6B3');
    root.style.setProperty('--foreground', '#905B40');
    root.style.setProperty('--highlight', '#CC7A2F');
    root.style.setProperty('--neutral', '#C7A671');
    root.style.setProperty('--card', '#FFFFFF');
    
    // Add derived colors
    root.style.setProperty('--primary-hover', '#297970');
    root.style.setProperty('--accent-hover', '#5B4141');
    root.style.setProperty('--muted-hover', '#E5C799');
    root.style.setProperty('--card-hover', '#F8F3EE');
    root.style.setProperty('--border', '#EDD6B3');
    root.style.setProperty('--input', '#F8F3EE');
    root.style.setProperty('--ring', '#339085');
  };

  const applyTheme = (colors) => {
    const root = document.documentElement;
    
    // Apply all color variables
    if (colors.primary) root.style.setProperty('--primary', colors.primary);
    if (colors.secondary) root.style.setProperty('--secondary', colors.secondary);
    if (colors.accent) root.style.setProperty('--accent', colors.accent);
    if (colors.background) root.style.setProperty('--background', colors.background);
    if (colors.muted) root.style.setProperty('--muted', colors.muted);
    if (colors.foreground) root.style.setProperty('--foreground', colors.foreground);
    if (colors.highlight) root.style.setProperty('--highlight', colors.highlight);
    if (colors.neutral) root.style.setProperty('--neutral', colors.neutral);
    if (colors.sectionBg) root.style.setProperty('--card', colors.sectionBg);
    
    // Add derived colors
    if (colors.primary) {
      const darkerPrimary = adjustColor(colors.primary, -20);
      root.style.setProperty('--primary-hover', darkerPrimary);
    }
    
    if (colors.accent) {
      const darkerAccent = adjustColor(colors.accent, -20);
      root.style.setProperty('--accent-hover', darkerAccent);
    }
    
    if (colors.muted) {
      const darkerMuted = adjustColor(colors.muted, -10);
      root.style.setProperty('--muted-hover', darkerMuted);
    }
    
    if (colors.sectionBg) {
      const hoveredCard = adjustColor(colors.sectionBg, -5);
      root.style.setProperty('--card-hover', hoveredCard);
    }
    
    if (colors.muted) {
      root.style.setProperty('--border', colors.muted);
    }
    
    if (colors.background) {
      root.style.setProperty('--input', colors.background);
    }
    
    if (colors.primary) {
      root.style.setProperty('--ring', colors.primary);
    }
  };
  
  // Helper to darken/lighten colors for hover states
  const adjustColor = (color, amount) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => 
      ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive", 
        description: "Error logging out"
      });
    }
  };

  async function loadCurrentUser() {
    setIsLoadingUser(true);
    try {
      const user = await User.me();
      if (!user) {
        setCurrentUser(null);
        setPendingMember(false);
        return;
      }
      
      setCurrentUser(user);
      
      const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
      setWelcomeMessage(welcomeMessages[randomIndex]);
      
      if (currentPageName !== "Register" && currentPageName !== "Login") {
        try {
          const normalizedEmail = user.email.toLowerCase().trim();
          console.log(`Looking up member with normalized email: ${normalizedEmail}`);
          
          // Get all members and find exact match
          const members = await Member.list();
          const memberRecord = members.find(m => 
            m.email?.toLowerCase().trim() === normalizedEmail
          );
          
          if (memberRecord) {
            console.log(`Found existing member with ID: ${memberRecord.id}`);
            setMemberId(memberRecord.id);
            setPendingMember(memberRecord.status === 'pending');
            
            // Update member email if it's not normalized
            if (memberRecord.email !== normalizedEmail) {
              console.log("Normalizing member email");
              await Member.update(memberRecord.id, { email: normalizedEmail });
            }
          } else {
            console.log(`No member found. Creating new member for ${normalizedEmail}`);
            const newMember = await Member.create({
              email: normalizedEmail,
              first_name: user.full_name?.split(' ')[0] || '',
              last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
              profile_image: user.profile_image || '',
              status: 'approved'
            });
            console.log(`Created new member with ID: ${newMember.id}`);
            setMemberId(newMember.id);
            setPendingMember(false);
          }
        } catch (error) {
          console.error("Error resolving member:", error);
          setPendingMember(false);
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setCurrentUser(null);
      setPendingMember(false);
    } finally {
      setIsLoadingUser(false);
    }
  }

  const renderUserProfile = () => {
    if (isLoadingUser) {
      return (
        <div className="flex flex-col items-center gap-3 p-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      );
    }

    if (!currentUser) return null;

    return (
      <div className="p-4 text-center">
        <Link to={createPageUrl("Profile")} className="block">
          <div className="flex flex-col items-center gap-3">
            {currentUser.profile_image ? (
              <img 
                src={currentUser.profile_image}
                alt={currentUser.full_name || "User"}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500/20 ring-offset-2"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-indigo-500/20 ring-offset-2">
                <span className="text-2xl text-indigo-600 font-semibold">
                  {(currentUser.full_name || "U").charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{currentUser.full_name}</p>
              <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
              <p className="text-sm text-gray-500 mt-2">{welcomeMessage}</p>
            </div>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate(createPageUrl("Profile"))} 
        >
          Edit Profile
        </Button>
      </div>
    );
  };

  // Find index of unread messages
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  // Add a useEffect to check for unread messages
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!memberId) return;
      
      try {
        const messages = await Message.list();
        const unreadCount = messages.filter(m => 
          m.recipient_id === memberId && !m.read
        ).length;
        
        setUnreadMessageCount(unreadCount);
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    };
    
    // Initial check
    if (memberId) {
      checkUnreadMessages();
    }
    
    // Set up polling every minute
    const intervalId = setInterval(() => {
      if (memberId) {
        checkUnreadMessages();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [memberId]);

  return (
    <ThemeProvider>
      <style>{`
        :root {
          --background: #EDEAE4;
          --primary: #339085;
          --primary-hover: #297970;
          --secondary: #7ABFAB;
          --accent: #6B4F4F;
          --accent-hover: #5B4141;
          --muted: #EDD6B3;
          --muted-hover: #E5C799;
          --card: #FFFFFF;
          --card-hover: #F8F3EE;
          --border: #EDD6B3;
          --input: #F8F3EE;
          --ring: #339085;
          --foreground: #905B40;
          --highlight: #CC7A2F;
          --neutral: #C7A671;
          --radius: 0.5rem;
        }

        body {
          background-color: #EDEAE4 !important;
        }

        .bg-background {
          background-color: #EDEAE4;
        }

        main {
          background-color: #EDEAE4 !important;
        }

        /* Update other background colors */
        .bg-gray-50,
        .bg-gray-100,
        .bg-\[\#f5f2ed\],
        .bg-\[\#EDEAE4\] {
          background-color: #EDEAE4 !important;
        }

        /* Card and section styling */
        .card, 
        .bg-white {
          background-color: var(--card);
          border-radius: var(--radius);
        }

        /* Button and UI element styling */
        .btn-primary, .bg-primary {
          background-color: var(--primary);
          color: white;
        }
        
        .btn-secondary, .bg-secondary {
          background-color: var(--secondary);
          color: white;
        }
        
        .btn-accent, .bg-accent {
          background-color: var(--accent);
          color: white;
        }

        /* Text styling */
        .text-primary {
          color: var(--primary);
        }

        .text-foreground {
          color: var(--foreground);
        }

        .border-primary {
          border-color: var(--primary);
        }

        .hover\\:bg-primary:hover {
          background-color: var(--primary-hover);
        }

        .hover\\:text-primary:hover {
          color: var(--primary-hover);
        }
        
        /* Override component styles with CSS variables */
        .bg-indigo-600, .hover\\:bg-indigo-700 {
          background-color: var(--primary);
        }
        
        .hover\\:bg-indigo-700:hover {
          background-color: var(--primary-hover);
        }
        
        .text-indigo-600, .text-\[\#8B4513\], .text-\[\#6B4F4F\], .text-\[\#905B40\] {
          color: var(--primary);
        }
        
        .text-\[\#A67B5B\] {
          color: var(--secondary);
        }
        
        .bg-\[\#F8F3EE\], .hover\\:bg-\[\#F8F3EE\] {
          background-color: var(--card-hover);
        }
        
        .bg-\[\#f5f2ed\], .bg-gray-50, .bg-\[\#EDEAE4\] {
          background-color: var(--background);
        }
        
        .bg-\[\#E8E0D8\], .border-\[\#E8E0D8\] {
          background-color: var(--muted);
          border-color: var(--muted);
        }
        
        .hover\\:text-\[\#8B4513\]:hover, .hover\\:text-\[\#5D2E0D\]:hover {
          color: var(--primary-hover);
        }

        /* Badges and tags */
        .badge {
          border-radius: 9999px;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Navigation sidebar styles from the image */
        .sidebar-nav-link {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .sidebar-nav-link.active {
          background-color: var(--card-hover);
          color: var(--primary);
        }
        
        .sidebar-nav-link:hover:not(.active) {
          background-color: var(--card-hover);
          color: var(--primary);
        }

        /* Stats cards */
        .stat-card {
          border-radius: var(--radius);
          padding: 1.5rem;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        /* Stat icon containers */
        .stat-icon-container {
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Section titles from the image */
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--foreground);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .section-title-icon {
          color: var(--highlight);
          font-size: 1.5rem;
        }
      `}</style>
      <div className="flex h-screen bg-[#EDEAE4]">
        {isLoadingUser ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : pendingMember ? (
          <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center">
            <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <Shield className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="mb-4 text-2xl font-bold text-gray-900">Membership Pending</h1>
              <p className="mb-6 text-gray-600">
                Thank you for your interest in joining our community. Your membership is currently pending approval.
              </p>
              <p className="mb-8 text-gray-600">
                You will receive an email notification once your membership is approved.
              </p>
              <Button 
                onClick={handleLogout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Return to Login
              </Button>
            </div>
          </div>
        ) : currentUser ? (
          <>
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <aside className={classNames(
              "fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <img 
                    src={appSettings.app_logo}
                    alt={appSettings.app_name}
                    className="w-8 h-8"
                  />
                  <h1 className="text-xl font-bold text-[#8B4513]">{appSettings.app_name}</h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {renderUserProfile()}

              <div className="mx-4 my-2 h-px bg-[#E8E0D8]"></div>

              <nav className="px-4 py-2">
                <Link
                  to={createPageUrl("Dashboard")}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    currentPageName === "Dashboard" 
                      ? "bg-[#F8F3EE] text-[#8B4513]" 
                      : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                  )}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link
                  to={createPageUrl("Members")}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    currentPageName === "Members" 
                      ? "bg-[#F8F3EE] text-[#8B4513]" 
                      : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                  )}
                >
                  <Users className="w-5 h-5" />
                  Members
                </Link>
                
                <Link
                  to={createPageUrl("Messages")}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    currentPageName === "Messages" 
                      ? "bg-[#F8F3EE] text-[#8B4513]" 
                      : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                  )}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                  {unreadMessageCount > 0 && (
                    <Badge className="ml-auto bg-[#E67E22] text-white h-5 min-w-5 flex items-center justify-center p-0 rounded-full">
                      {unreadMessageCount}
                    </Badge>
                  )}
                </Link>
                
                <Link
                  to={createPageUrl("Insights")}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    currentPageName === "Insights" 
                      ? "bg-[#F8F3EE] text-[#8B4513]" 
                      : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                  )}
                >
                  <Sparkles className="w-5 h-5" />
                  Insights
                </Link>
                <Link
                  to={createPageUrl("Ventures")}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    currentPageName === "Ventures" 
                      ? "bg-[#F8F3EE] text-[#8B4513]" 
                      : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                  )}
                >
                  <Briefcase className="w-5 h-5" />
                  Ventures
                </Link>
                <Link
                  to={createPageUrl("ActionCards")}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    currentPageName === "ActionCards" 
                      ? "bg-[#F8F3EE] text-[#8B4513]" 
                      : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                  )}
                >
                  <Layers className="w-5 h-5" />
                  Action Cards
                </Link>
                <Link
                  to={createPageUrl("AppStore")}
                  className={classNames(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    currentPageName === "AppStore" 
                      ? "bg-[#F8F3EE] text-[#8B4513]" 
                      : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                  )}
                >
                  <Box className="w-5 h-5" />
                  App Store
                </Link>
                
                {currentUser?.role === 'admin' && (
                  <>
                    <Link
                      to={createPageUrl("ReplicationGuide")}
                      className={classNames(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mt-4 border-t pt-4",
                        currentPageName === "ReplicationGuide" 
                          ? "bg-[#F8F3EE] text-[#8B4513]" 
                          : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                      )}
                    >
                      <Box className="w-5 h-5" />
                      Replication Guide
                    </Link>
                    <Link
                      to={createPageUrl("Settings")}
                      className={classNames(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                        currentPageName === "Settings" 
                          ? "bg-[#F8F3EE] text-[#8B4513]" 
                          : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                      )}
                    >
                      <SettingsIcon className="w-5 h-5" />
                      Settings
                    </Link>
                    <Link
                      to={createPageUrl("ExportDatabase")}
                      className={classNames(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                        currentPageName === "ExportDatabase" 
                          ? "bg-[#F8F3EE] text-[#8B4513]" 
                          : "text-gray-600 hover:text-[#8B4513] hover:bg-[#F8F3EE]"
                      )}
                    >
                      <Download className="w-5 h-5" />
                      Export Database
                    </Link>
                  </>
                )}

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-start gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </Button>
                </div>
              </nav>
            </aside>

            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
              <header className="sticky top-0 z-40 lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-3">
                  <img 
                    src={appSettings.app_logo}
                    alt={appSettings.app_name}
                    className="w-6 h-6"
                  />
                  <h1 className="text-lg font-bold text-gray-900">{appSettings.app_name}</h1>
                </div>
                <div className="w-10" />
              </header>

              <main className="flex-1 overflow-auto bg-[#EDEAE4] p-4">
                {children}
              </main>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-gray-50">
            <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <Shield className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="mb-4 text-2xl font-bold text-gray-900">Welcome to Community Hub</h1>
              <p className="mb-6 text-gray-600">
                Please sign in to access the community resources and connect with other members.
              </p>
              <Button 
                onClick={() => User.login()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

