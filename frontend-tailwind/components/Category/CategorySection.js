import React, { useState, useEffect } from 'react'
import Loader from '../Loader'
import InfiniteScroll from 'react-infinite-scroll-component'
import DisplayPosts from '../Feed/DisplayPosts'
import { useQuery } from 'react-query'
import Link from 'next/link'
import DisplayTrendingProfiles from '../Trending/DisplayTrendingProfiles'
import { useAppContext } from '../../context/AppContext'
export default function CategorySection({ category }) {

    const { isLoading } = useQuery("posts", fetchPosts);
    const [posts, setPosts] = useState([]);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10;
    const [hasMore, setHasMore] = useState(true);
    const notRefreshing = true
    const [profiles, setProfiles] = useState([])
    const context = useAppContext()
    const isLoggedIn = context.isLoggedIn

    useEffect(() => {
        async function fetchTrendingProfiles() {
            const response = await fetch(`/api/announcement/posts/1/20?` + new URLSearchParams({
                sort_by: "top",
                minutes_filter: 1440,
            }));
            const data = await response.json();
            setProfiles(data);
        }

        fetchTrendingProfiles()
    }, [notRefreshing])


    async function fetchPosts() {
        const response = await fetch(`/api/announcement/posts/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({
            sort_by: "top",
            minutes_filter: 10000,
            category: category
        }));
        const data = await response.json();
        if (!data.length) setHasMore(false);
        setPosts(posts.concat(data));
        setIter((prevIter) => prevIter + 1);
    }

    return (
        <div className="flex justify-center w-screen h-screen px-4 overflow-hidden text-inherit bg-base-100">
            <div className="flex w-full max-w-screen-lg ">
                <div className="flex flex-col py-4 pr-3">
                    <Link href="/discover">
                        <a
                            className="px-3 py-2 mt-2 text-lg hover:text-base-100 font-medium rounded-lg hover:bg-secondary">
                            Discover
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
                <div className="flex flex-col flex-grow border-l border-r border-neutral scrollbar-hide overflow-auto">
                    <div className="sticky px-8 py-4 border-b border-neutral">
                        <h1 className="text-inherit font-bold text-xl leading-8 my-1">#{category}</h1>
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
                        <h3 className="mt-6 font-semibold">Today&apos;s trending profiles</h3>
                        <DisplayTrendingProfiles profiles={profiles} />
                    </div>
                </div>
            </div>
        </div >
    )
}
