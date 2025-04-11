import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function StatsCards({ title, value, description, icon: Icon, iconColor, iconBg, loading, link }) {
  return (
    <Card className="overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-3xl font-bold text-[#8B4513]">{value}</p>
            )}
            {loading ? (
              <Skeleton className="h-3 w-32" />
            ) : (
              <p className="text-xs text-[#A67B5B]">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBg} shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        {!loading && (
          <Link to={link} className="mt-4 inline-flex items-center text-sm font-medium text-[#8B4513] hover:text-[#5D2E0D]">
            View Details <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}