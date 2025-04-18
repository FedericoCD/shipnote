"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpdatePreviewProps {
  selectedTickets: string[];
  selectedTone: string;
  linearApiKey: string;
}

export function UpdatePreview({
  selectedTickets,
  selectedTone,
  linearApiKey,
}: UpdatePreviewProps) {
  const [generatedUpdate, setGeneratedUpdate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!selectedTickets.length) return;

    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          selectedTickets,
          tone: selectedTone,
          linearApiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push("/login");
          return;
        }
        throw new Error(errorData.error || "Failed to generate update");
      }

      const data = await response.json();
      setGeneratedUpdate(data.update);
    } catch (error) {
      console.error("Error generating update:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate update"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUpdate);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedTickets.length || !linearApiKey}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Update"
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="relative">
        <Textarea
          value={generatedUpdate}
          readOnly
          className="min-h-[300px] resize-none"
          placeholder="Your generated update will appear here..."
        />
        {generatedUpdate && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
