import React from 'react';
import { Card, CardHeader } from "@/components/ui/card";

export default function VentureCard({ venture }) {
  return (
    <Card className="bg-white overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          {venture.members.slice(0, 3).map((member, i) => (
            <div key={i} className="relative inline-block">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                {member.profile_image ? (
                  <img
                    src={member.profile_image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#F8F3EE] text-[#8B4513]">
                    {member.name[0]}
                  </div>
                )}
              </div>
            </div>
          ))}
          {venture.members.length > 3 && (
            <div className="w-10 h-10 rounded-full bg-[#F8F3EE] flex items-center justify-center text-sm text-[#8B4513]">
              +{venture.members.length - 3}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}