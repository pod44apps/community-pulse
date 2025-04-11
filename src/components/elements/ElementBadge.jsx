import React from 'react';

const elements = {
  fire: {
    icon: "🔥",
    label: "Fire",
    bgColor: "bg-red-100",
    textColor: "text-red-700"
  },
  water: {
    icon: "💧",
    label: "Water",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700"
  },
  air: {
    icon: "💨",
    label: "Air",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700"
  },
  earth: {
    icon: "🌱",
    label: "Earth",
    bgColor: "bg-green-100",
    textColor: "text-green-700"
  }
};

export default function ElementBadge({ element, size = "md", showLabel = true }) {
  if (!element || !elements[element]) return null;
  
  const elementData = elements[element];
  
  const sizeClasses = {
    sm: "text-xs py-0.5 px-1.5",
    md: "text-sm py-1 px-2",
    lg: "text-base py-1.5 px-3"
  };
  
  const iconSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };
  
  return (
    <span className={`rounded-full inline-flex items-center ${elementData.bgColor} ${elementData.textColor} ${sizeClasses[size]}`}>
      <span className={`${iconSizes[size]} mr-1`}>{elementData.icon}</span>
      {showLabel && <span>{elementData.label}</span>}
    </span>
  );
}