import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const elements = [
  {
    id: "fire",
    name: "Fire",
    icon: "🔥",
    color: "bg-red-100 border-red-300",
    activeColor: "border-red-500 bg-red-100",
    iconBg: "bg-red-500"
  },
  {
    id: "water",
    name: "Water",
    icon: "💧",
    color: "bg-blue-100 border-blue-300",
    activeColor: "border-blue-500 bg-blue-100",
    iconBg: "bg-blue-500"
  },
  {
    id: "air",
    name: "Air",
    icon: "💨",
    color: "bg-indigo-100 border-indigo-300",
    activeColor: "border-indigo-500 bg-indigo-100",
    iconBg: "bg-indigo-500"
  },
  {
    id: "earth",
    name: "Earth",
    icon: "🌱",
    color: "bg-green-100 border-green-300",
    activeColor: "border-green-500 bg-green-100",
    iconBg: "bg-green-500"
  }
];

export default function ElementSelector({ value, onChange, label }) {
  return (
    <div>
      <Label className="block mb-2">{label}</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex gap-3"
      >
        {elements.map((element) => (
          <div key={element.id} className="flex items-center space-x-2">
            <RadioGroupItem
              value={element.id}
              id={`${label}-${element.id}`}
              className="sr-only"
            />
            <Label
              htmlFor={`${label}-${element.id}`}
              className={`flex flex-col items-center justify-center border-2 p-3 rounded-lg cursor-pointer transition-all ${
                value === element.id ? element.activeColor : element.color
              }`}
            >
              <span className="text-2xl mb-1">{element.icon}</span>
              <span className="text-sm font-medium">{element.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}