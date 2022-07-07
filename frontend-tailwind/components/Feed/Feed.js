import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import DisplayPosts from "./DisplayPosts";
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from "../Loader";
import Link from "next/link";
import DisplayTrendingProfiles from "../Trending/DisplayTrendingProfiles";
import { useAppContext } from "../../context/AppContext";

export default function Feed({ category }) {
  const { error, isError, isLoading } = useQuery("posts", fetchPosts);
  const [posts, setPosts] = useState([]);
  const [iter, setIter] = useState(1);
  const [filter, setFilter] = useState("top")
  const [time, setTime] = useState(1440)
  const [profiles, setProfiles] = useState([])
  const [hasMore, setHasMore] = useState(true);
  const numMessagesPerScroll = 10;
  const notRefreshing = true
  const context = useAppContext()
  const isLoggedIn = context.isLoggedIn

  async function fetchPosts() {
    setTimeout(async () => {
      let response
      if (category) {
        response = await fetch(`/api/announcement/posts/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({
          sort_by: filter,
          minutes_filter: time,
          category: category
        }));
      }
      else {
        response = await fetch(`/api/announcement/posts/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({
          sort_by: filter,
          minutes_filter: time,
        }));
      }

      const data = await response.json();
      if (!data.length) setHasMore(false);
      setPosts(posts.concat(data));
      setIter((prevIter) => prevIter + 1);
    }, 1500);
  }

  useEffect(() => {
    fetchPosts()
  }, [time, filter])

  useEffect(() => {
    async function fetchTrendingProfiles() {
      const response = await fetch(`/api/announcement/posts/1/10?` + new URLSearchParams({
        sort_by: "top",
        minutes_filter: 1440,
      }));
      const data = await response.json();
      setProfiles(data);
    }

    fetchTrendingProfiles()
  }, [notRefreshing])

  return (
    <div className="flex justify-center w-screen h-screen px-4 text-inherit bg-base-100">
      <div className="flex w-full max-w-screen-lg ">
        <div className="flex flex-col items-center py-4 pr-3">
          <Link href="/">
            <a
              className="px-3 py-2 mt-2 text-lg hover:text-base-100 font-medium rounded-lg hover:bg-secondary">
              Home
            </a>
          </Link>
          {isLoggedIn ?
            <>
              <Link href="/create-post">
                <a className="py-2 mt-2 text-lg hover:text-base-100 font-medium rounded-lg hover:bg-secondary">
                  New Post
                </a>
              </Link>
              <Link href="/airdrop">
                <a
                  className="px-3 py-2 mt-2 text-lg hover:text-base-100 font-medium rounded-lg hover:bg-secondary">
                  Airdrop
                </a>
              </Link>
              <Link href="/auth/signin">
                <a
                  className="px-3 py-2 mt-2 text-lg hover:text-base-100 font-medium rounded-lg hover:bg-secondary">
                  Connect
                </a>
              </Link>
            </> : <></>}

          {/* <a className="flex px-3 py-2 mt-2 mt-auto hover:text-base-100 text-lg rounded-lg font-medium hover:bg-secondary" href="/profile">
                        <span className="flex-shrink-0 w-10 h-10 bg-base-300 rounded-full"></span>
                        <div className="flex flex-col ml-2">
                            <span className="mt-1 text-sm font-semibold leading-none">Username</span>
                            <span className="mt-1 text-xs leading-none">@username</span>
                        </div>
                    </a> */}
        </div>
        <div className="flex flex-col flex-grow border-l border-r border-neutral scrollbar-hide overflow-y-scroll">
          <div className="flex justify-between flex-shrink-0 px-8 py-4 border-b border-neutral">
            <select className="focus:outline-none h-8 rounded-xl px-2 border-sm bg-primary" id="filter"
              value={filter}
              onChange={(e) => {
                const selectedFilter = e.target.value;
                setFilter(selectedFilter);
                setPosts([])
              }}>
              <option value="top">top</option>
              <option value="new">new</option>
            </select>
            {category ? <h1 className="text-inherit font-bold text-xl leading-8 my-1">#{category}</h1> : <></>}
            <select className="focus:outline-none h-8 rounded-xl px-2 border-sm bg-primary" id="time"
              value={time}
              onChange={(e) => {
                const selectedTime = e.target.value
                setTime(parseInt(selectedTime));
                setPosts([])
              }}>
              <option value="60">hour</option>
              <option value="1440">day</option>
              <option value="10080">week</option>
              <option value="43800">month</option>
            </select>
          </div>
          {isLoading ? (
            <Loader text="Loading posts..." />
          ) : (
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchPosts}
              hasMore={hasMore}
              loader={<Loader text="Loading..." />}
            >
              <DisplayPosts posts={posts} />
            </InfiniteScroll>
          )}
        </div>
        <div className="flex flex-col flex-shrink-0 w-1/4 pl-4 overflow-y-auto">
          <div>
            <h3 className="mt-6 font-semibold">Today&apos;s top 10 trending profiles</h3>
            <DisplayTrendingProfiles profiles={profiles} />
          </div>
        </div>
      </div>
    </div >
  );
}
