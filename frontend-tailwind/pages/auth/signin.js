import { signIn, getCsrfToken, getProviders, signOut, useSession } from 'next-auth/react'
import SocialLoginSVG from '../../components/Buttons/SocialLoginSVG'
import { useToasts } from 'react-toast-notifications'
import { useAppContext } from '../../context/AppContext'
import { useEffect, useState } from 'react'

const Signin = ({ csrfToken, providers }) => {

    const { addToast } = useToasts()
    const { data: session } = useSession(null)
    const context = useAppContext()
    const id = context.id

    async function connectAccount() {

        let linkedProfile = null
        const imageURL = session.user.image

        if (imageURL.includes("twimg")) linkedProfile = "Twitter"
        else if (imageURL.includes("googleusercontent")) linkedProfile = "Google"
        else if (imageURL.includes("discordapp")) linkedProfile = "Discord"
        else if (imageURL.includes("githubusercontent")) linkedProfile = "GitHub"

        const response = await fetch(`api/user/link?` + new URLSearchParams({
            account_type: linkedProfile,
            account_value: session.user.email ?? session.user.name,
            user_msa_id: id,
            wait_for_inclusion: true
        }), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        const data = await response.json()
        return data
    }


    return (
        <div className="h-full w-full py-16 px-4">
            <div className="flex flex-col items-center justify-center">
                <div className="bg-base-100 border-primary shadow border-2 rounded-md lg:w-1/3  md:w-1/2 w-full p-10 mt-16">
                    {
                        !session &&
                        <p tabIndex="0" className="focus:outline-none text-2xl font-extrabold leading-6 text-inherit">Connect your accounts to earn rewards!</p>
                    }
                    {
                        providers && !session &&
                        Object.values(providers).map(provider => (
                            <div key={provider.name} className="mb-0">
                                <button onClick={() => signIn(provider.id)} className={`py-3.5 px-4 border rounded-lg border-primary-focus flex items-center w-full mt-4 bg-base-100`}>
                                    <SocialLoginSVG type={provider.name} />
                                </button>
                            </div>
                        ))
                    }
                    {
                        session &&
                        <>
                            <p tabIndex="0" className="focus:outline-none text-2xl font-extrabold leading-6 text-inherit">Account authorized:</p>
                            <p className="mt-5"> Welcome, {session.user.name ?? session.user.email}</p> <br />
                            <div className='w-full flex justify-center'>
                                <img className='h-48 w-48' src={session.user.image} alt="" />
                            </div>
                            <div className='flex justify-between'>
                                <button className='bg-primary-focus text-white font-bold py-2 mr-5 px-4 rounded-md mt-5 hover:bg-primary-focus focus:outline-none focus:shadow-outline' onClick={() => {
                                    connectAccount()
                                }}>
                                    Connect
                                </button>
                                <button className='bg-primary-focus text-white font-bold py-2 px-4 rounded-md mt-5 hover:bg-primary-focus focus:outline-none focus:shadow-outline' onClick={() => {
                                    signOut()
                                }}>
                                    Sign out
                                </button>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div >
    )
}

export default Signin

export async function getServerSideProps(context) {
    const providers = await getProviders()
    const csrfToken = await getCsrfToken(context)
    return {
        props: {
            providers,
            csrfToken
        },
    }
}