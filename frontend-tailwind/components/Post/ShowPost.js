import React, { useState } from 'react'
import DisplayComments from './DisplayComments'
import Loader from '../Loader'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useQuery } from 'react-query'
import { useToasts } from "react-toast-notifications";
import Post from '../Feed/Post'

export default function ShowPost({ post }) {

    const { addToast } = useToasts()
    const { error, isError, isLoading } = useQuery("comments", fetchComments);
    const [comments, setComments] = useState([]);
    const [iter, setIter] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const numMessagesPerScroll = 10;

    async function fetchComments() {
        const response = await fetch(`/api/announcement/comments/${iter}/${numMessagesPerScroll}?` + new URLSearchParams({ post_hash: post.ipfs_hash }));
        const data = await response.json();
        console.log(data)
        if (!data.length) setHasMore(false);
        setComments(comments.concat(data));
        setIter((prevIter) => prevIter + 1);
    }

    const handleSubmit = async (event) => {

        event.preventDefault()

        const body = {
            post_hash: post.ipfs_hash,
            parent_comment_hash: post.ipfs_hash,
            depth: 0,
            body: event.target.comment.value,
            is_nsfw: false
        }

        const response = await fetch('/api/submit/comment?' + new URLSearchParams({
            user_msa_id: post.msa_id,
            wait_for_finalization: false,
            wait_for_inclusion: true
        }), {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json();

        addToast("Comment was created and will finalize on the blockchain soon.", {
            appearance: 'success',
            autoDismiss: true,
        })

        console.log(data)

    }



    return (
        <div className="container mx-auto my-5 p-5">
            <main className="flex flex-row justify-center h-auto md:flex md:-mx-2 ">
                <div className="w-3/5 md:w-3/5 h-auto mx-4 bg-base-200 ">
                    <div className="p-3 border-t-4 border-primary">
                        <Post post={post} fullImage={true} />
                    </div>
                    <div className="py-2 px-4 bg-base-200 rounded-b-xl">
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="editor" className="sr-only">Insert a comment </label>
                            <textarea id="comment" rows="8" className="block px-0 w-full text-sm text-inherit bg-base-200 border-2 border-primary rounded-xl focus:ring-0 " placeholder="Write a comment..." required></textarea>
                            <div className="flex justify-end mt-2">
                                <button className="flex items-center h-8 px-2 text-md bg-primary rounded-xl hover:bg-primary-focus">
                                    Publish
                                </button>
                            </div>
                        </form>
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
            </main >
        </div >
    )
}
