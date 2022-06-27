import React, { useState } from 'react'
import InfiniteScroll from "react-infinite-scroll-component";
import { useQuery } from "react-query";
import DisplayPosts from "../Feed/DisplayPosts";
import Loader from '../Loader';
import { useAppContext } from '../../context/AppContext';
import MockDisplayPosts from '../Mocks/MockDisplayPosts';
export default function ProfileInfo({ type }) {

    const { error, isError, isLoading } = useQuery("posts", fetchUserPosts);
    const [posts, setPosts] = useState([]);
    const [iter, setIter] = useState(1);
    const numMessagesPerScroll = 10;
    const context = useAppContext();
    const id = context.id;

    async function fetchUserPosts() {
        console.log(id)
        const response = await fetch(`api/posts/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({
            minutes_filter: 10000,
            user_msa_id: id
        }));

        const data = await response.json();
        setPosts(posts.concat(data));
        setIter((prevIter) => prevIter + 1);
    }

    async function fetchUserComments() {
        const response = await fetch(`api/posts/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({
            sort_by: "new",
            minutes_filter: 10000,
            user_msa_id: id
        }));


        const data = await response.json();
        setPosts(posts.concat(data));
        setIter((prevIter) => prevIter + 1);
    }

    return (
        <div className="w-2/5 md:w-2/5 max-h-screen  mx-4 bg-base-200 overflow-y-auto overflow-x-hidden">
            <div className="p-3 border-t-4 border-primary">
                <h1 className="text-inherit font-bold text-xl leading-8 my-1">{type}</h1>
                <div className="flex flex-col">
                    {isLoading ? (
                        <Loader text="Loading posts..." />
                    ) : (
                        <DisplayPosts posts={posts} />
                    )}
                </div>
            </div>
        </div>
    )
}
