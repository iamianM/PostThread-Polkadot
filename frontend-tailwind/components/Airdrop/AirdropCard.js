import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useToasts } from 'react-toast-notifications'
//https://cointelegraph.com/news/nifty-news-fluf-world-and-snoop-dogg-fundraise-adidas-and-prada-nfts-wax-gifts-10m-nfts

export default function AirdropCard() {

    const context = useAppContext()
    const loggedUser = context.username

    const { addToast } = useToasts()

    const [value, setValue] = useState(0)
    const [redditName, setRedditName] = useState('')

    const handleSubmit = async (event) => {
        // Stop the form from submitting and refreshing the page.
        event.preventDefault()

        const username = event.target.username.value
        setRedditName(username)
        const airdropInfo = await checkAirdrop(username)
        setValue(airdropInfo?.airdrop_value)
    }

    async function checkAirdrop(username) {
        const response = await fetch(`/api/airdrop/check/${username}?` + new URLSearchParams({
            postthread_username: loggedUser
        }))
        const data = await response.json()
        return data
    }

    async function claimAirdrop() {
        const response = await fetch(`/api/airdrop/claim/${redditName}?` + new URLSearchParams({
            postthread_username: loggedUser,
            wait_for_inclusion: true
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (data.status_code === 407) {
            addToast(`We could not match any of your recent posts with the message we provided for you. 
            Please post again and make sure you are using the exact message we provide you.`,
                { appearance: 'error', autoDismiss: true })
        }
        else {
            addToast(`Airdrop tokens successfully claimed!`,
                { appearance: 'success', autoDismiss: true })
        }

        console.log(data)
        return data
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gray-200">

            <card className="w-1/3 bg-base-300 border border-gray-100 rounded-lg text-center hover:shadow-lg align-center">
                <img src="/airdrop.jpeg" className="rounded-t-lg" />
                <div className="flex justify-center">
                    <span className="flex-shrink-0 w-12 h-12 bg-primary-400 -mt-6 rounded-full">
                        <img alt="profil" src="/postthreadicon.png"
                            className="mx-auto object-cover rounded-full" />
                    </span>
                </div>

                {value === 0 ?
                    <>
                        <p className="font-bold pt-3 pb-2"> PostThread Airdrop </p>
                        <p className="px-10 py-2 mb-5 text-gray-500">The PostThread airdrop rewards users with a number of tokens determined by their existing reddit karma. Insert your username to check how much tokens you can receive for free!</p>

                        <form className="m-4 flex justify-center" onSubmit={handleSubmit}>
                            <input id="username" className="rounded-l-lg p-4 border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-neutral-100" placeholder="username" />
                            <button type='submit' className="px-8 rounded-r-lg bg-primary text-inherit font-bold p-4 uppercase border-primary border-t border-b border-r">Check</button>
                        </form>
                    </> :
                    <><p className="font-bold pt-3 pb-2"> {`Airdrop value: ${value}🧵`}  </p>
                        <p className="font-semibold pt-3 pb-2"> Post the following message on reddit to receive the thread tokens:  </p>
                        <p className="px-10 py-2 mb-5 text-gray-500">{`I received an airdrop of ${value} thread tokens just by signing up to www.PostThread.com and making this post.\n
                         My reward was based on the karma I earned on Reddit. Now I can level up my account and earn more tokens by posting.\n
                         Come join me on www.PostThread.com/referral/${loggedUser} and claim your airdrop too! Using my referral will also \n
                         earn us both 5000 experience!`}</p>
                        <button className="bg-primary px-4 py-2 mb-4 rounded-xl font-semibold text-inherit hover:bg-secondary-focus focus:ring focus:ring-purple-500 focus:ring-opacity-25 outline-none"
                            onClick={claimAirdrop}>
                            Claim!
                        </button>
                    </>}
            </card>
        </div >
    )
}
