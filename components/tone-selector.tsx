"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const TONES = [
  {
    id: "executive",
    label: "Executive",
    description: "Formal and business-focused",
  },
  { id: "casual", label: "Casual", description: "Friendly and conversational" },
  {
    id: "changelog",
    label: "Changelog",
    description: "Technical and detailed",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Engaging and promotional",
  },
];

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

export function ToneSelector({
  selectedTone,
  onToneChange,
}: ToneSelectorProps) {
  return (
    <RadioGroup
      value={selectedTone}
      onValueChange={onToneChange}
      className="space-y-4"
    >
      {TONES.map((tone) => (
        <div key={tone.id} className="flex items-center space-x-3">
          <RadioGroupItem value={tone.id} id={tone.id} />
          <Label htmlFor={tone.id} className="flex flex-col">
            <span className="font-medium">{tone.label}</span>
            <span className="text-sm text-muted-foreground">
              {tone.description}
            </span>
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
