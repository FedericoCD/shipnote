"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2, XCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface LinearUser {
  name: string;
  email: string;
}

interface LinearConnectionProps {
  onApiKeyChange: (apiKey: string) => void;
}

export function LinearConnection({ onApiKeyChange }: LinearConnectionProps) {
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linearUser, setLinearUser] = useState<LinearUser | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("linear_api_keys")
        .select("api_key")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No API key found - normal for new users
          setIsConnected(false);
          setIsLoading(false);
          return;
        }
        // Only log and set error for unexpected errors
        console.error("Error fetching API key:", error);
        setError("Failed to fetch API key status");
        setIsConnected(false);
      } else if (data) {
        console.log("Found existing API key");
        setApiKey(data.api_key);
        onApiKeyChange(data.api_key);
        // Verify the stored API key still works
        await verifyApiKey(data.api_key);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch API key status");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyApiKey = async (apiKey: string): Promise<boolean> => {
    console.log("Starting API key verification");
    setError(null);
    setIsLoading(true);

    try {
      console.log("Sending verify request");
      const response = await fetch("/api/linear/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ apiKey }),
      });

      console.log("Verify response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Verification failed:", errorData);
        throw new Error(errorData.error || "Failed to verify API key");
      }

      const data = await response.json();
      console.log("Verification successful:", data);

      if (data.success && data.user) {
        setLinearUser(data.user);
        setIsConnected(true);
        return true;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      console.error("Error in verifyApiKey:", error);
      setError(
        error instanceof Error ? error.message : "Failed to verify API key"
      );
      setIsConnected(false);
      setLinearUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) return;

    setIsUpdating(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // First verify the API key works
      const isValid = await verifyApiKey(apiKey);
      if (!isValid) {
        throw new Error("Invalid API key");
      }

      // If verification successful, save to Supabase
      const { error: upsertError } = await supabase
        .from("linear_api_keys")
        .upsert({
          api_key: apiKey,
          user_id: user.id,
        });

      if (upsertError) {
        console.error("Supabase upsert error:", upsertError);
        throw upsertError;
      }
    } catch (error) {
      console.error("Error connecting to Linear:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        router.push("/login");
        return;
      }
      setError(
        error instanceof Error ? error.message : "Failed to connect to Linear"
      );
      setIsConnected(false);
      setLinearUser(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisconnect = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error: deleteError } = await supabase
        .from("linear_api_keys")
        .delete()
        .single();

      if (deleteError) throw deleteError;

      setApiKey("");
      setIsConnected(false);
      setLinearUser(null);
      onApiKeyChange("");
    } catch (error) {
      console.error("Error disconnecting from Linear:", error);
      setError("Failed to disconnect from Linear");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking Linear connection...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="linear-api-key">Linear API Key</Label>
          <div className="flex items-center gap-2 mt-1.5">
            <Input
              id="linear-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                isConnected ? "••••••••" : "Enter your Linear API key"
              }
              disabled={isUpdating || isConnected}
            />
            {isConnected ? (
              <Button
                onClick={handleDisconnect}
                disabled={isUpdating}
                variant="outline"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isUpdating || !apiKey.trim()}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              {linearUser && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  {linearUser.name}
                </div>
              )}
            </div>
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
