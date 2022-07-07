import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeSelector from "./ThemeSelector";
import UserLink from "./UserLink";
import LogoutButton from "../Buttons/LogoutButton";
import { useAppContext } from "../../context/AppContext";
import LoginButton from "../Buttons/LoginButton";
import SearchBar from "./SearchBar";

export default function Header() {

  const context = useAppContext()
  const username = context.username


  return (
    <nav className="w-full bg-primary w-screen sticky top-0">
      <div className="flex items-center justify-between mx-auto xl:max-w-7xl lg:max-w-5xl md:max-w-3xl md:px-2 px-4">
        <Link href="/" className="group outline-none rounded-lg">
          <section className="flex items-center text-inherit space-x-2" style={{ cursor: 'pointer' }}>
            <Image src="/postthreadicon.png" height={40} width={40} />
            <a className="font-bold text-xl  outline-none rounded-lg">
              PostThread
            </a>
          </section>
        </Link>
        <section>
          <ul className="md:space-x-8 space-x-6  text-inherit  font-semibold hidden md:flex items-center">
            <li className="relative group">
              <ThemeSelector />
            </li>
            {username ? (
              <li className="relative group">
                <UserLink username={username} />
              </li>
            ) : (
              <></>
            )}
            <li className="relative group">
              <SearchBar placeholder={"Search an user..."} />
            </li>
            <li>{username ? <LogoutButton /> : <LoginButton />}</li>
          </ul>
        </section>
      </div>
    </nav>
  );
}
