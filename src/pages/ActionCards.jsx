
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Pencil, Trash2, Filter, Layers, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import { ActionCard } from "@/api/entities";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

export default function ActionCards() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const actionCards = await ActionCard.list();
      setCards(actionCards);
    } catch (error) {
      console.error("Error loading action cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Knowledge':
        return 'bg-[#7ABFAB] text-white';
      case 'Location':
        return 'bg-[#F4A261] text-white';
      case 'Talent Sharing':
        return 'bg-[#6B4F4F] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddCard = async (cardData) => {
    try {
      // In a real app, you would create a new action card in the database
      // For now, we'll just add it to the local state
      const newCard = {
        id: `a${cards.length + 1}`,
        ...cardData,
        owner: {
          name: "Ronen Gafni", // This would be the current user
          image: ""
        },
        isOwner: true
      };
      
      setCards([newCard, ...cards]);
      return newCard;
    } catch (error) {
      console.error("Error adding action card:", error);
      throw error;
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await ActionCard.delete(cardId);
      await loadCards(); // Reload the cards
      setCardToDelete(null);
      return true;
    } catch (error) {
      console.error("Error deleting action card:", error);
      return false;
    }
  };

  const handleViewCard = (cardId) => {
    navigate(createPageUrl(`ActionCardDetail?id=${cardId}`));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#6B4F4F]">Action Cards</h1>
        <Button 
          onClick={() => navigate(createPageUrl("ActionCardEditor"))}
          className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]"
        >
          <Plus className="h-4 w-4" /> 
          New Action Card
        </Button>
      </div>

      <div className="mb-8 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search action cards..."
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

      {cards.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No action cards yet</h3>
          <p className="text-gray-500 mb-6">Be the first to create an action card!</p>
          <Button 
            onClick={() => navigate(createPageUrl("ActionCardEditor"))}
            className="gap-2 bg-[#8B4513] hover:bg-[#5D2E0D]"
          >
            <Plus className="h-4 w-4" /> 
            New Action Card
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card 
            key={card.id} 
            className="overflow-hidden border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div 
              className="relative h-48 overflow-hidden"
              onClick={() => handleViewCard(card.id)}
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
              />
              {card.isOwner && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button 
                    variant="ghost"
                    size="icon" 
                    className="h-8 w-8 bg-white/90 hover:bg-white rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(createPageUrl(`ActionCardDetail?id=${card.id}&edit=true`));
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
                      setCardToDelete(card);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <CardContent 
              className="p-6"
              onClick={() => handleViewCard(card.id)}
            >
              <Badge className={`mb-2 ${getCategoryStyle(card.category)}`}>
                {card.category}
              </Badge>
              
              <h3 className="text-xl font-semibold text-[#6B4F4F] mt-2 mb-1">
                {card.title}
              </h3>
              <p className="text-gray-600 mb-4">{card.description}</p>

              {/* Updated member info section with fixed image display */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-[#F8F3EE] rounded-lg">
                {card.owner.image ? (
                  <img
                    src={card.owner.image}
                    alt={card.owner.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#EDD6B3] flex items-center justify-center">
                    <span className="text-sm font-medium text-[#339085]">
                      {card.owner.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-[#6B4F4F]">
                    {card.owner.name}
                  </div>
                  <div className="text-xs text-gray-500">Owner</div>
                </div>
              </div>

              {card.location && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[#6B4F4F] mb-2">Location</h4>
                  <span className="text-sm text-gray-600">{card.location}</span>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-[#6B4F4F] mb-2">Quantity: {card.quantity}</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="bg-[#F8F3EE] text-[#6B4F4F] border-[#E8E0D8]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cardToDelete && (
        <DeleteConfirmDialog
          title="Delete Action Card"
          description="Are you sure you want to delete this action card? This action cannot be undone."
          onClose={() => setCardToDelete(null)}
          onConfirm={() => handleDeleteCard(cardToDelete.id)}
        />
      )}
    </div>
  );
}
