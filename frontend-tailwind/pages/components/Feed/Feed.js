import React, { useState } from 'react'
import axios from "axios";
import { useQuery } from "react-query";
import DisplayPosts from './DisplayPosts';
import InfiniteScroll from "react-infinite-scroll-component";
import Loader from '../Loader';


export default function Feed() {

    const { error, isError, isLoading } = useQuery("posts", fetchPosts);
    const [posts, setPosts] = useState([]);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10

    async function fetchPosts() {
        const { data } = await axios.get(
            `http://cupochia.ddns.net:5000/posts/${iter}/${numMessagesPerScroll}`
        );
        console.log(data, iter, numMessagesPerScroll)
        setPosts(posts.concat(data.results));
        setIter(prevIter => prevIter + 1);
    }

    return (

        <div className="flex justify-center w-screen h-screen px-4 text-gray-700">
            <div className="flex w-full max-w-screen-lg">
                <div className="flex flex-col w-64 py-4 pr-3">
                    <a className="px-3 py-2 mt-2 text-lg font-medium rounded-sm hover:bg-gray-300" href="/">Home</a>
                    <a className="px-3 py-2 mt-2 text-lg font-medium rounded-sm hover:bg-gray-300" href="/discover">Discover</a>
                    <a className="flex px-3 py-2 mt-2 mt-auto text-lg rounded-sm font-medium hover:bg-gray-200" href="/profile">
                        <span className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-full"></span>
                        <div className="flex flex-col ml-2">
                            <span className="mt-1 text-sm font-semibold leading-none">Username</span>
                            <span className="mt-1 text-xs leading-none">@username</span>
                        </div>
                    </a>
                </div>
                <div className="flex flex-col flex-grow border-l border-r border-gray-300">
                    <div className="flex justify-between flex-shrink-0 px-8 py-4 border-b border-gray-300">
                        <h1 className="text-xl font-semibold">Feed Title</h1>
                        <a href="/create-post">
                            <button className="flex items-center h-8 px-2 text-sm bg-gray-300 rounded-sm hover:bg-gray-400">New post</button>
                        </a>
                    </div>
                    <div className="flex-grow h-0 overflow-auto">
                        <div className="flex w-full p-8 border-b-4 border-gray-300">
                            <span className="flex-shrink-0 w-12 h-12 bg-gray-400 rounded-full"></span>
                            <div className="flex flex-col flex-grow ml-4">
                                <textarea className="p-3 bg-transparent border border-gray-500 rounded-sm" name="" id="" rows="3" placeholder="What's happening?"></textarea>
                                <div className="flex justify-between mt-2">
                                    <button className="flex items-center h-8 px-3 text-xs rounded-sm hover:bg-gray-200">Attach</button>
                                    <button className="flex items-center h-8 px-3 text-xs rounded-sm bg-gray-300 hover:bg-gray-400">Post</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full p-8 border-b border-gray-300">
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
                <div className="flex flex-col flex-shrink-0 w-1/4 py-4 pl-4">
                    <input className="flex items-center h-8 px-2 border border-gray-500 rounded-sm" type="search" placeholder="Search…" />
                    <div>
                        <h3 className="mt-6 font-semibold">Trending</h3>
                        <div className="flex w-full py-4 border-b border-gray-300">
                            <span className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-full"></span>
                            <div className="flex flex-col flex-grow ml-2">
                                <div className="flex text-sm">
                                    <span className="font-semibold">Username</span>
                                    <span className="ml-1">@username</span>
                                </div>
                                <p className="mt-1 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, et dolore magna aliqua. <a className="underline" >#hashtag</a></p>
                            </div>
                        </div>
                        <div className="flex w-full py-4 border-b border-gray-300">
                            <span className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-full"></span>
                            <div className="flex flex-col flex-grow ml-2">
                                <div className="flex text-sm">
                                    <span className="font-semibold">Username</span>
                                    <span className="ml-1">@username</span>
                                </div>
                                <p className="mt-1 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, et dolore magna aliqua. <a className="underline">#hashtag</a></p>
                            </div>
                        </div>
                        <div className="flex w-full py-4 border-b border-gray-300">
                            <span className="flex-shrink-0 w-10 h-10 bg-gray-400 rounded-full"></span>
                            <div className="flex flex-col flex-grow ml-2">
                                <div className="flex text-sm">
                                    <span className="font-semibold">Username</span>
                                    <span className="ml-1">@username</span>
                                </div>
                                <p className="mt-1 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit, et dolore magna aliqua. <a className="underline" >#hashtag</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
