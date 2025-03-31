import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SeasonsSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SeasonsSelector({ value, onChange }: SeasonsSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-indigo-500/50 transition-colors w-full h-[42px]">
        <SelectValue placeholder="Select a season" />
      </SelectTrigger>
      <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
        <SelectItem value="summer" className="hover:bg-indigo-900/30 focus:bg-indigo-900/40">Summer</SelectItem>
        <SelectItem value="winter" className="hover:bg-indigo-900/30 focus:bg-indigo-900/40">Winter</SelectItem>
        <SelectItem value="spring" className="hover:bg-indigo-900/30 focus:bg-indigo-900/40">Spring</SelectItem>
        <SelectItem value="fall" className="hover:bg-indigo-900/30 focus:bg-indigo-900/40">Fall</SelectItem>
      </SelectContent>
    </Select>
  );
}