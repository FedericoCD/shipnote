"use client";

import { useState } from "react";
import AuthButtonClient from "@/components/header-auth-client";
import { LinearTicketSelector } from "@/components/linear-ticket-selector";
import { ToneSelector } from "@/components/tone-selector";
import { UpdatePreview } from "@/components/update-preview";

export default function HomePage() {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState("executive");

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Update Generator</h1>
        <AuthButtonClient />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Select Linear Tickets
            </h2>
            <LinearTicketSelector
              selectedTickets={selectedTickets}
              onTicketsChange={setSelectedTickets}
            />
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Choose Update Tone</h2>
            <ToneSelector
              selectedTone={selectedTone}
              onToneChange={setSelectedTone}
            />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Generated Update</h2>
          <UpdatePreview
            selectedTickets={selectedTickets}
            selectedTone={selectedTone}
          />
        </div>
      </div>
    </div>
  );
}
