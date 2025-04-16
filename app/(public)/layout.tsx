import Header from "@/components/header";
import React from "react";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default PublicLayout;
