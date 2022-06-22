import React, { useState, useEffect } from 'react'
import { useQuery } from "react-query";
import DisplayPosts from './DisplayPosts';
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from '../Loader';
import TrendingPost from './TrendingPost';

export default function Feed() {

    const { error, isError, isLoading } = useQuery("posts", fetchPosts);
    const [posts, setPosts] = useState([]);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10


    async function fetchPosts() {
        const response = await fetch(`/api/posts/${iter}/${numMessagesPerScroll}`)
        const data = await response.json()
        setPosts(posts.concat(data));
        setIter(prevIter => prevIter + 1);
    }

    return (

        <div className="flex justify-center w-screen h-screen px-4 text-inherit bg-base-100">
            <div className="flex w-full max-w-screen-lg ">
                <div className="flex flex-col w-64 py-4 pr-3">
                    <a className="px-3 py-2 mt-2 text-lg hover:text-base-100 text-primary font-medium rounded-lg hover:bg-secondary" href="/">Home</a>
                    <a className="px-3 py-2 mt-2 text-lg hover:text-base-100 font-medium rounded-lg hover:bg-secondary" href="/discover">Discover</a>
                    {/* <a className="flex px-3 py-2 mt-2 mt-auto hover:text-base-100 text-lg rounded-lg font-medium hover:bg-secondary" href="/profile">
                        <span className="flex-shrink-0 w-10 h-10 bg-base-300 rounded-full"></span>
                        <div className="flex flex-col ml-2">
                            <span className="mt-1 text-sm font-semibold leading-none">Username</span>
                            <span className="mt-1 text-xs leading-none">@username</span>
                        </div>
                    </a> */}
                </div>
                <div className="flex flex-col flex-grow border-l border-r border-neutral">
                    <div className="flex justify-between flex-shrink-0 px-8 py-4 border-b border-neutral">
                        <a href="/create-post">
                            <button className="flex items-center h-8 px-2 text-md bg-primary rounded-xl hover:bg-primary-focus">New Post</button>
                        </a>
                    </div>
                    <div className="flex-grow h-0 overflow-auto">
                        <div className="flex w-full p-8 border-b border-neutral">
                            {isLoading ?
                                <Loader text="Loading posts..." />
                                :
                                <div>
                                    <InfiniteScroll
                                        dataLength={posts.length}
                                        next={fetchPosts}
                                        hasMore={true}
                                        loader={<Loader text="Loading..." />}>
                                        <DisplayPosts posts={posts} />
                                    </InfiniteScroll>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="flex flex-col flex-shrink-0 w-1/4 pl-4">
                    <div>
                        <h3 className="mt-6 font-semibold">Trending</h3>
                        <TrendingPost />
                        <TrendingPost />
                        <TrendingPost />
                    </div>
                </div>
            </div>
        </div>
    )
}
