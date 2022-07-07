import React, { useState } from 'react'
import Link from 'next/link'

export default function SearchBar({ placeholder }) {

    const [filteredData, setFilteredData] = useState([])
    const [wordEntered, setWordEntered] = useState("");

    async function fetchUsers(word) {
        const response = await fetch('/api/user/data?' + new URLSearchParams({
            username: word,
            multiple: true
        }))
        const data = await response.json()
        setFilteredData(data)
    }

    const handleFilter = async (event) => {
        const searchWord = event.target.value.toLowerCase()
        setWordEntered(searchWord);
        if (searchWord === "") {
            setFilteredData([])
        } else {
            await fetchUsers(searchWord)
        }
    }

    const clearInput = () => {
        setWordEntered("");
        setFilteredData([])
    }

    return (
        <div className="bg-secondary rounded-md">
            <div className="inline-flex flex-col flex-start justify-center  relative text-inherit">
                <div className="grid">
                    <input type="text" className="p-2 pl-8 rounded-md bg-secondary text-inherit"
                        value={wordEntered}
                        placeholder={placeholder}
                        onChange={handleFilter} />
                    {filteredData.length === 0 ?
                        <svg className="w-4 h-4 absolute left-2.5 top-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg> :
                        <button onClick={clearInput}>
                            <svg className="w-4 h-4 absolute left-2.5 top-3.5 cursor-pointer" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.22566 4.81096C5.83514 4.42044 5.20197 4.42044 4.81145 4.81096C4.42092 5.20148 4.42092 5.83465 4.81145 6.22517L10.5862 11.9999L4.81151 17.7746C4.42098 18.1651 4.42098 18.7983 4.81151 19.1888C5.20203 19.5793 5.8352 19.5793 6.22572 19.1888L12.0004 13.4141L17.7751 19.1888C18.1656 19.5793 18.7988 19.5793 19.1893 19.1888C19.5798 18.7983 19.5798 18.1651 19.1893 17.7746L13.4146 11.9999L19.1893 6.22517C19.5799 5.83465 19.5799 5.20148 19.1893 4.81096C18.7988 4.42044 18.1657 4.42044 17.7751 4.81096L12.0004 10.5857L6.22566 4.81096Z" fill="black" />
                            </svg>
                        </button>
                    }
                </div>
                {
                    filteredData.length > 0 && (
                        <ul className="bg-base-100 border-primary max-h-80 rounded-md absolute z-10 w-full top-12 overflow-hidden overflow-y-auto scrollbar-hide">
                            {filteredData.slice(0, 15).map((user, index) => {
                                return (
                                    <li key={index} onClick={() => {
                                        setFilteredData([])
                                    }} className="flex flex-row justify-between items-center p-1 border-b-2 relative cursor-pointer hover:bg-primary-focus hover:text-gray-900">
                                        <img alt="profil" src={user.profile_pic}
                                            className="h-12 w-12 object-cover rounded-full" />
                                        <Link href={{
                                            pathname: `/profile/${encodeURIComponent(user.msa_id)}`,
                                            query: user
                                        }}>
                                            <a>
                                                <p>{user.username}</p>
                                            </a>
                                        </Link>
                                    </li>
                                )
                            })
                            }
                        </ul>
                    )
                }
            </div>
        </div>
    )
}
