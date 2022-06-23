import React, { useState } from 'react'
import Image from 'next/image'

export default function Editor() {

    const [text, setText] = useState('')
    const [title, setTitle] = useState('')
    const [isNSFW, setIsNSFW] = useState(true)
    const [url, setUrl] = useState('')
    const [category, setCategory] = useState('')

    async function handleSubmit() {

    }


    return (
        <>
            <div className="max-w-2xl mx-auto">
                <div class="text-center bg-base-100 text-inherit py-5 px-6">
                    <h1 class="text-2xl font-bold mt-0 mb-6">Create a new post</h1>
                </div>
                <input className="h-12 px-2 border-2 w-full border-primary rounded-xl bg-base-100 text-inherit" type="input" placeholder="Title..." required />
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 w-full bg-primary my-5 rounded-xl border border-neutral-focus">
                        <div className="flex justify-between items-center py-2 px-3 border-b">
                            <div className="flex flex-wrap items-center">
                                <div className="flex flex-wrap h-8 items-center sm:pl-5">
                                    <Image src="/plus-18.png" width={22} height={22} />
                                </div>
                                <div className="flex flex-wrap items-center space-x-1 sm:pl-4">
                                    <select className="focus:outline-none h-5 rounded-md px-2 border-sm bg-secondary">
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                    </select>
                                </div>
                            </div>
                            <input className="h-8 px-2 border-2 border-primary rounded-xl bg-base-100 text-inherit" type="input" placeholder="Category..." required />
                        </div>
                        <div className="py-2 px-4 bg-base-200 rounded-b-xl">
                            <label htmlFor="editor" className="sr-only">Publish post</label>
                            <textarea id="editor" rows="8" className="block px-0 w-full text-sm text-inherit bg-base-200 border-0 focus:ring-0 " placeholder="Write a post..." required></textarea>
                        </div>
                    </div>
                    <input className="h-8 px-2 border-2 w-full border-primary rounded-xl bg-base-100 text-inherit" type="input" placeholder="Image URL..." />
                    <button type="submit" className="inline-flex items-center px-5 my-5 py-2.5 text-sm font-medium text-center text-inherit bg-primary rounded-lg hover:bg-primary-focus">
                        Publish post
                    </button>
                </form>
            </div>
        </>
    )
}
