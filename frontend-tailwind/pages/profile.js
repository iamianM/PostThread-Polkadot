import React, { useState } from 'react'
import { useQuery } from "react-query";
import DisplayPosts from './components/Feed/DisplayPosts';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from './components/Loader';
import ProfileCard from './components/Profile/ProfileCard';

export default function Profile() {

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
        <div className="container mx-auto my-5 p-5">
            <div className="md:flex no-wrap md:-mx-2 ">
                <ProfileCard />
                <div className="flex-grow h-0 overflow-auto">
                    <div className="w-full md:w-9/12 mx-2 h-64">
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
        </div>

    )
}
