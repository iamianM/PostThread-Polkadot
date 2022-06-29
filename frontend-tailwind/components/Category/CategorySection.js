import React, { useState } from 'react'
import Loader from '../Loader'
import InfiniteScroll from 'react-infinite-scroll-component'
import DisplayPosts from '../Feed/DisplayPosts'
import { useQuery } from 'react-query'

export default function CategorySection({ category }) {

    const { isLoading } = useQuery("posts", fetchPosts);
    const [posts, setPosts] = useState([]);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10;
    const [hasMore, setHasMore] = useState(true);


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
        <div className="flex justify-center w-screen h-screen px-4 py-10 text-inherit bg-base-100">
            <div className="w-3/5 md:w-3/5 max-h-screen  mx-4 bg-base-200 overflow-y-auto overflow-x-hidden">
                <div className="p-3 border-t-4 border-primary">
                    <h1 className="text-inherit font-bold text-xl leading-8 my-1">#{category}</h1>
                    <div id="scrollableDiv" className="flex-grow overflow-auto">
                        <div className="flex w-full p-8 border-b border-neutral">
                            {isLoading ? (
                                <Loader text="Loading posts..." />
                            ) : (
                                <div>
                                    <InfiniteScroll
                                        dataLength={posts.length}
                                        next={fetchPosts}
                                        hasMore={hasMore}
                                        loader={<Loader text="Loading..." />}
                                        scrollableTarget="scrollableDiv"
                                    >
                                        <DisplayPosts posts={posts} />
                                    </InfiniteScroll>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
