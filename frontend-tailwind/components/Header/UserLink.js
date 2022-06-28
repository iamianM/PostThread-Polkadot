import Link from "next/link";
import React from "react";
import { useAppContext } from "../../context/AppContext";

export default function UserLink() {

  const context = useAppContext()
  const user = {
    username: context.username,
    id: context.id,
    profilePic: context.profilePic
  }


  return (
    <Link href={{
      pathname: `/profile/${encodeURIComponent(user.id)}`,
      query: user
    }}>
      <a
        className="flex px-3 py-2 mt-2 mt-auto hover:text-base-100 text-lg rounded-lg font-medium hover:bg-secondary"
      >
        <span className="flex-shrink-0 w-10 h-10 bg-base-300 rounded-full">
          <img alt="profil" src={context.profilePic}
            className="mx-auto object-cover rounded-full" />
        </span>
        <div className="flex flex-col ml-2">
          <span className="mt-1 text-sm font-semibold leading-none">
            {context.username}
          </span>
          <span className="mt-1 text-xs leading-none">@{context.username}</span>
        </div>
      </a>
    </Link>
  );
}
