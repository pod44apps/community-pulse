import React, { useState, useEffect } from "react";
import { Message } from "@/api/entities";
import { Member } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Inbox, 
  Send, 
  Search, 
  MessageSquare, 
  ChevronRight, 
  Trash2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MessageModal from "@/components/messages/MessageModal";

export default function Messages() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [membersMap, setMembersMap] = useState({});
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const currentUser = await User.me();
      
      // Find current member ID
      const members = await Member.list();
      const currentMember = members.find(m => 
        m.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
      );
      
      if (!currentMember) {
        setIsLoading(false);
        return;
      }
      
      setCurrentMemberId(currentMember.id);
      
      // Build a map of member IDs to member data for easier lookup
      const membersById = {};
      members.forEach(member => {
        membersById[member.id] = member;
      });
      setMembersMap(membersById);
      
      // Load messages
      const allMessages = await Message.list();
      
      // Filter messages based on active tab
      const filteredMessages = allMessages.filter(message => {
        if (activeTab === "inbox") {
          return message.recipient_id === currentMember.id;
        } else {
          return message.sender_id === currentMember.id;
        }
      });
      
      setMessages(filteredMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await Message.update(messageId, { read: true });
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, read: true } : msg)
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await Message.delete(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleReply = (message) => {
    const otherPartyId = activeTab === "inbox" ? message.sender_id : message.recipient_id;
    const otherPartyMember = membersMap[otherPartyId];
    if (otherPartyMember) {
      setReplyTo(otherPartyMember);
    }
  };

  const filteredMessages = messages.filter(message => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const sender = membersMap[message.sender_id];
    const recipient = membersMap[message.recipient_id];
    
    return (
      message.subject?.toLowerCase().includes(searchLower) ||
      message.content?.toLowerCase().includes(searchLower) ||
      sender?.first_name?.toLowerCase().includes(searchLower) ||
      sender?.last_name?.toLowerCase().includes(searchLower) ||
      recipient?.first_name?.toLowerCase().includes(searchLower) ||
      recipient?.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const unreadCount = messages.filter(m => !m.read && m.recipient_id === currentMemberId).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#6B4F4F] mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b px-4">
            <TabsList className="h-14">
              <TabsTrigger value="inbox" className="data-[state=active]:bg-[#F8F3EE] data-[state=active]:text-[#6B4F4F] relative">
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-[#E67E22] text-white">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="data-[state=active]:bg-[#F8F3EE] data-[state=active]:text-[#6B4F4F]">
                <Send className="mr-2 h-4 w-4" />
                Sent
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="grid md:grid-cols-[350px_1fr] border-b">
            {/* Message List */}
            <div className="border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="h-[calc(100vh-280px)] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map(message => {
                    const otherPartyId = activeTab === "inbox" ? message.sender_id : message.recipient_id;
                    const otherParty = membersMap[otherPartyId] || { first_name: "Unknown", last_name: "User" };
                    
                    return (
                      <div 
                        key={message.id}
                        className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                          message.id === selectedMessage?.id ? 'bg-[#F8F3EE]' : ''
                        } ${!message.read && activeTab === "inbox" ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          setSelectedMessage(message);
                          if (!message.read && activeTab === "inbox") {
                            handleMarkAsRead(message.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EDD6B3] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-[#339085]">
                              {otherParty.first_name?.charAt(0) || "?"}{otherParty.last_name?.charAt(0) || ""}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start">
                              <p className={`font-medium truncate ${!message.read && activeTab === "inbox" ? 'text-[#6B4F4F]' : 'text-gray-700'}`}>
                                {otherParty.first_name} {otherParty.last_name}
                              </p>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {format(new Date(message.created_date), 'MMM d')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{message.subject || "No subject"}</p>
                            <p className="text-xs text-gray-500 truncate">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Message Detail */}
            <div className="p-6">
              {selectedMessage ? (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-semibold text-[#6B4F4F]">
                      {selectedMessage.subject || "No subject"}
                    </h2>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-500"
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReply(selectedMessage)}
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#EDD6B3] flex items-center justify-center">
                      {activeTab === "inbox" ? (
                        <span className="text-sm font-medium text-[#339085]">
                          {(membersMap[selectedMessage.sender_id]?.first_name || "?").charAt(0)}
                          {(membersMap[selectedMessage.sender_id]?.last_name || "").charAt(0)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-[#339085]">
                          {(membersMap[selectedMessage.recipient_id]?.first_name || "?").charAt(0)}
                          {(membersMap[selectedMessage.recipient_id]?.last_name || "").charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activeTab === "inbox" 
                          ? `${membersMap[selectedMessage.sender_id]?.first_name || "Unknown"} ${membersMap[selectedMessage.sender_id]?.last_name || "User"}`
                          : `To: ${membersMap[selectedMessage.recipient_id]?.first_name || "Unknown"} ${membersMap[selectedMessage.recipient_id]?.last_name || "User"}`
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedMessage.created_date), 'PPpp')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {selectedMessage.content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No message selected</h3>
                  <p className="text-gray-500">Select a message from the list to view it</p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </div>
      
      {replyTo && (
        <MessageModal
          recipientMember={replyTo}
          onClose={() => {
            setReplyTo(null);
            loadMessages(); // Refresh messages after sending
          }}
        />
      )}
    </div>
  );
}