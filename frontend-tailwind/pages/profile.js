import React, { useState } from 'react'
import axios from "axios";
import { useQuery } from "react-query";
import DisplayPosts from './components/Feed/DisplayPosts';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from './components/Loader';

export default function Profile() {

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
        <div class="container mx-auto my-5 p-5">
            <div class="md:flex no-wrap md:-mx-2 ">
                <div class="w-full md:w-3/12 md:mx-2">
                    <div class="bg-white p-3 border-t-4 border-green-400">
                        <div class="image overflow-hidden">
                            <img class="h-auto w-full mx-auto"
                                src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                                alt="" />
                        </div>
                        <h1 class="text-gray-900 font-bold text-xl leading-8 my-1">Jane Doe</h1>
                        <h3 class="text-gray-600 font-lg text-semibold leading-6">Owner at Her Company Inc.</h3>
                        <p class="text-sm text-gray-500 hover:text-gray-600 leading-6">Lorem ipsum dolor sit amet
                            consectetur adipisicing elit.
                            Reprehenderit, eligendi dolorum sequi illum qui unde aspernatur non deserunt</p>
                        <ul
                            class="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                            <li class="flex items-center py-3">
                                <span>Status</span>
                                <span class="ml-auto"><span
                                    class="bg-green-500 py-1 px-2 rounded text-white text-sm">Active</span></span>
                            </li>
                            <li class="flex items-center py-3">
                                <span>Member since</span>
                                <span class="ml-auto">Nov 07, 2016</span>
                            </li>
                        </ul>
                    </div>
                </div>
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

    )
}
