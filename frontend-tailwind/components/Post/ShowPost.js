import React, { useState } from 'react'
import { isImage } from '../../utils/Utils'
import ThumbsDown from '../Buttons/ThumbsDown'
import ThumbsUp from '../Buttons/ThumbsUp'
import CommentsButton from '../Buttons/CommentsButton'
import { randomIntFromInterval } from '../../utils/Utils'
import DisplayComments from './DisplayComments'
import Loader from '../Loader'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useQuery } from 'react-query'

export default function ShowPost({ post }) {

    const [showImage, setShowImage] = useState(true)
    const username = post.username
    const body = post.body
    const randomImageNumber = randomIntFromInterval(1, 6)
    const imageSrc = `https://www.tailwind-kit.com/images/blog/${randomImageNumber}.jpg`
    const image = post.url ? post.url : imageSrc

    const onError = () => {
        setShowImage(false);
    }

    const { error, isError, isLoading } = useQuery("comments", fetchComments);
    const [comments, setComments] = useState([]);
    const [iter, setIter] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const numMessagesPerScroll = 10;

    async function fetchComments() {
        const response = await fetch(`api/announcement/comments/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({ post_hash: post.ipfs_hash }));
        const data = await response.json();
        console.log(data)
        if (!data.length) setHasMore(false);
        setComments(comments.concat(data));
        setIter((prevIter) => prevIter + 1);
    }



    return (
        <div className="container mx-auto my-5 p-5">
            <main className="flex flex-row justify-center h-auto md:flex md:-mx-2 ">
                <div className="w-3/5 md:w-3/5 h-auto mx-4 bg-base-200 ">
                    <div className="p-3 border-t-4 border-primary">
                        <div className="flex  w-auto p-8 border-b border-gray-300">
                            <span className="flex-shrink-0 w-12 h-12 bg-primary-400 rounded-full">
                                <img alt="profil" src={post.profile_pic}
                                    className="mx-auto object-cover rounded-full" />
                            </span>
                            <div className="flex flex-col flex-grow ml-4">
                                <div className="flex">
                                    {/* <span className="font-semibold">@{username}</span> */}
                                    <span className="font-semibold">@{username}</span>
                                    <span className="ml-auto text-sm">{post.date_minted}</span>
                                </div>
                                <p className="font-bold">{post.title}</p>
                                <p className="mt-1">{body}</p>
                                <div className="flex items-center justify-center h-auto mt-2 bg-primary-200">
                                    {isImage(image) ? (showImage ?
                                        <img alt="image" onError={onError} src={image} className="flex items-center justify-center h-auto " />
                                        : <img alt="image-not-found" src="./not-found.png" className="flex items-center justify-center h-auto " />
                                    ) : ""
                                    }
                                </div>
                                <div className="flex mt-2 items-center justify-between">
                                    <ThumbsUp upvotes={post.upvotes} />
                                    <ThumbsDown downvotes={post.downvotes} />
                                    <CommentsButton numberOfComments={post.num_comments} />
                                    <p className="font-bold">#{post.category}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col flex-grow mt-4 mb-4 max-h-screen overflow-y-auto bg-base-200 overflow-x-hidden'>
                        {isLoading ? (
                            <Loader text="Loading comments..." />
                        ) : (
                            <div>
                                <InfiniteScroll
                                    dataLength={comments.length}
                                    next={fetchComments}
                                    hasMore={hasMore}
                                    loader={<Loader text="Loading..." />}
                                >
                                    <DisplayComments comments={comments} />
                                </InfiniteScroll>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
