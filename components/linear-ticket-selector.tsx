"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchIssues, LinearTicket } from "@/utils/linear";
import { Loader2, RefreshCw } from "lucide-react";

interface LinearTicketSelectorProps {
  selectedTickets: string[];
  onTicketsChange: (tickets: string[]) => void;
  apiKey: string;
}

export function LinearTicketSelector({
  selectedTickets,
  onTicketsChange,
  apiKey,
}: LinearTicketSelectorProps) {
  const [tickets, setTickets] = useState<LinearTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!apiKey) return;

    setIsLoading(true);
    setError(null);
    try {
      const fetchedTickets = await fetchIssues(apiKey);
      setTickets(fetchedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("Failed to fetch tickets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch tickets when the component mounts or when apiKey changes
  useEffect(() => {
    if (apiKey) {
      fetchTickets();
    }
  }, [apiKey]);

  const handleTicketSelect = (ticketId: string) => {
    onTicketsChange(
      selectedTickets.includes(ticketId)
        ? selectedTickets.filter((id) => id !== ticketId)
        : [...selectedTickets, ticketId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {tickets.length} tickets found
        </div>
        <Button
          onClick={fetchTickets}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

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
              <div className="text-sm text-muted-foreground line-clamp-2">
                {ticket.completedAt && (
                  <div className="mt-1 text-xs">
                    Completed on{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(new Date(ticket.completedAt))}
                  </div>
                )}
              </div>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
