import React from 'react'
import Comments from '../Buttons/Comments'
import ThumbsDown from '../Buttons/ThumbsDown'
import ThumbsUp from '../Buttons/ThumbsUp'

export default function Post({ post }) {

    const username = post.data.username === "removed" ? "Username" : post.data.username
    const randomPersonNumber = randomIntFromInterval(3, 10)
    const profilePic = post.data.profile_pic === "removed" ? `https://www.tailwind-kit.com/images/person/${randomPersonNumber}.jpg` : post.data.profile_pic
    const body = post.data.body === "" ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " : post.data.body
    const randomImageNumber = randomIntFromInterval(1, 6)
    const imageSrc = `https://www.tailwind-kit.com/images/blog/${randomImageNumber}.jpg`
    const image = post.data.url ? post.data.url : imageSrc


    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    return (
        <div className="flex w-full p-8 border-b border-gray-300">
            <span className="flex-shrink-0 w-12 h-12 bg-gray-400 rounded-full">
                <img alt="profil" src={profilePic}
                    className="mx-auto object-cover rounded-full" />
            </span>
            <div className="flex flex-col flex-grow ml-4">
                <div className="flex">
                    <span className="font-semibold">{username}</span>
                    <span className="ml-1">@{username}</span>
                    <span className="ml-auto text-sm">Just now</span>
                </div>
                <p className="mt-1">{body}<a className="underline" href="#">#hashtag</a></p>
                <div className="flex items-center justify-center h-64 mt-2 bg-gray-200">
                    <img alt="image" src={image} className="flex items-center justify-center h-64 " />
                </div>
                <div className="flex mt-2">
                    <ThumbsUp upvotes={post.data.upvotes} />
                    <ThumbsDown downvotes={post.data.downvotes} />
                    <Comments numberOfComments={post.data.num_comments} />
                </div>
            </div>
        </div>
    )
}
