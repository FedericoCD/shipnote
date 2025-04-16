"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";

export default function AuthButtonClient() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <Button onClick={handleSignOut} variant="outline">
        Sign out
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/register">Sign up</Link>
      </Button>
    </div>
  );
}
