import Link from "next/link";
import React from "react";
import { isImage } from "../../utils/Utils";

export default function UserLink() {

  const username = localStorage.getItem("username");
  const profile_pic = localStorage.getItem("profile_pic");
  const imageSrc = "/postthreadicon.png";
  const image = isImage(profile_pic) ? profile_pic : imageSrc

  return (
    <Link href="/profile">
      <a
        className="flex px-3 py-2 mt-2 mt-auto hover:text-base-100 text-lg rounded-lg font-medium hover:bg-secondary"

      >
        <span className="flex-shrink-0 w-10 h-10 bg-base-300 rounded-full">
          <img alt="profil" src={image}
            className="mx-auto object-cover rounded-full" />
        </span>
        <div className="flex flex-col ml-2">
          <span className="mt-1 text-sm font-semibold leading-none">
            {username}
          </span>
          <span className="mt-1 text-xs leading-none">@{username}</span>
        </div>
      </a>
    </Link>
  );
}
