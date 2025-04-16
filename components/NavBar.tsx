"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX, ReactNode } from "react";
import React, { use } from "react";

function NavBar() {
  const pathname = usePathname();
  console.log(pathname)
  return (
    <div
      className={`absolute top-0 left-0 w-full h-[100px] ${
        (pathname === '/signUp' || pathname === '/logIn') ? "hidden" : "flex"
      } justify-between items-center px-20 z-[1]`}
    >
      <div>Vroomify</div>
      <ul>
        <li>
          <Link href="/signUp">LogIn</Link>
        </li>
      </ul>
    </div>
  );
}

export default NavBar;
