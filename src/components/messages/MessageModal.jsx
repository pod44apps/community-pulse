import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Message } from "@/api/entities";
import { User } from "@/api/entities";
import { Member } from "@/api/entities";
import { toast } from "@/components/ui/use-toast";

export default function MessageModal({ recipientMember, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    content: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get current user
      const currentUser = await User.me();
      
      // Find sender's member record
      const members = await Member.list();
      const senderMember = members.find(m => 
        m.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
      );
      
      if (!senderMember) {
        throw new Error("Your member profile needs to be set up before sending messages");
      }
      
      // Create the message
      await Message.create({
        sender_id: senderMember.id,
        recipient_id: recipientMember.id,
        subject: formData.subject || `Message from ${senderMember.first_name} ${senderMember.last_name}`,
        content: formData.content,
        read: false
      });
      
      toast({
        description: `Message sent to ${recipientMember.first_name} ${recipientMember.last_name}`
      });
      
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        description: `Failed to send message: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-[#6B4F4F]">
            Message to {recipientMember.first_name} {recipientMember.last_name}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter message subject"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your message here..."
              className="mt-1 h-32"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#339085] hover:bg-[#2A7268]"
              disabled={isLoading || !formData.content}
            >
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}