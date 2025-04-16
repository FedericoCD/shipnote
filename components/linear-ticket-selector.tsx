"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinearTicket {
  id: string;
  title: string;
  description: string;
  state: string;
  url: string;
}

interface LinearTicketSelectorProps {
  selectedTickets: string[];
  onTicketsChange: (tickets: string[]) => void;
}

export function LinearTicketSelector({
  selectedTickets,
  onTicketsChange,
}: LinearTicketSelectorProps) {
  const [tickets, setTickets] = useState<LinearTicket[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = async () => {
    if (!apiKey) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/linear/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();
      setTickets(data.tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketSelect = (ticketId: string) => {
    onTicketsChange(
      selectedTickets.includes(ticketId)
        ? selectedTickets.filter((id) => id !== ticketId)
        : [...selectedTickets, ticketId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">Linear API Key</Label>
        <div className="flex gap-2">
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Linear API key"
          />
          <Button onClick={fetchTickets} disabled={!apiKey || isLoading}>
            {isLoading ? "Loading..." : "Fetch Tickets"}
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
          >
            <Checkbox
              id={ticket.id}
              checked={selectedTickets.includes(ticket.id)}
              onCheckedChange={() => handleTicketSelect(ticket.id)}
            />
            <Label htmlFor={ticket.id} className="flex-1">
              <div className="font-medium">{ticket.title}</div>
              <div className="text-sm text-muted-foreground">
                {ticket.state}
              </div>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
