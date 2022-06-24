import React from 'react'
import Image from 'next/image'
import { useToasts } from "react-toast-notifications";

export default function Editor() {

    const { addToast } = useToasts()

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()

        const post = {
            category: event.target.category.value,
            title: event.target.title.value,
            body: event.target.body.value,
            url: event.target.url.value,
            is_nsfw: event.target.isNSFW.value,
        }

        console.log(JSON.stringify(post))
        const id = localStorage.getItem("msa_id")

        try {
            const response = await fetch(`api/submit/post?` + new URLSearchParams({
                user_msa_id: id,
                wait_for_inclusion: true,
                wait_for_finalization: true
            }), {
                method: 'POST',
                body: JSON.stringify({ post }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            )

            const data = response.json()
            console.log(data)

            addToast("Post was created and will finalize on the blockchain soon.", {
                appearance: 'success',
                autoDismiss: true,
            })

        } catch (error) {
            console.log(error)
            addToast("Post creation failed", {
                appearance: 'error',
                autoDismiss: true,
            })
        }
    }


    return (
        <>
            <div className="max-w-2xl mx-auto">
                <div className="text-center bg-base-100 text-inherit py-5 px-6">
                    <h1 className="text-2xl font-bold mt-0 mb-6">Create a new post</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <input className="h-12 px-2 border-2 w-full border-primary rounded-xl bg-base-100 text-inherit" type="text" id="title" placeholder="Title..." required />
                    <div className="mb-4 w-full bg-primary my-5 rounded-xl border border-neutral-focus">
                        <div className="flex justify-between items-center py-2 px-3 border-b">
                            <div className="flex flex-wrap items-center">
                                <div className="flex flex-wrap h-8 items-center sm:pl-5">
                                    <Image src="/plus-18.png" width={22} height={22} />
                                </div>
                                <div className="flex flex-wrap items-center space-x-1 sm:pl-4">
                                    <select className="focus:outline-none h-5 rounded-md px-2 border-sm bg-secondary" id="isNSFW">
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                    </select>
                                </div>
                            </div>
                            <input className="h-8 px-2 border-2 border-primary rounded-xl bg-base-100 text-inherit" type="text" id="category" placeholder="Category..." required />
                        </div>
                        <div className="py-2 px-4 bg-base-200 rounded-b-xl">
                            <label htmlFor="editor" className="sr-only">Publish post</label>
                            <textarea id="body" rows="8" className="block px-0 w-full text-sm text-inherit bg-base-200 border-0 focus:ring-0 " placeholder="Write a post..." required></textarea>
                        </div>
                    </div>
                    <input className="h-8 px-2 border-2 w-full border-primary rounded-xl bg-base-100 text-inherit" type="text" id="url" placeholder="Image URL..." />
                    <button type="submit" className="inline-flex items-center px-5 my-5 py-2.5 text-sm font-medium text-center text-inherit bg-primary rounded-lg hover:bg-primary-focus">
                        Publish post
                    </button>
                </form>
            </div>
        </>
    )
}
