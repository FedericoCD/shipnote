import React from "react";
import { ThemeSwitcher } from "./theme-switcher";
import HeaderAuth from "./header-auth";
import Link from "next/link";

const Header = () => {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <Link href={"/"} className="font-semibold">
          Shipnote.ai
        </Link>
        <div className="flex gap-4 items-center font-semibold">
          <ThemeSwitcher />
          <HeaderAuth />
        </div>
      </div>
    </nav>
  );
};

export default Header;
