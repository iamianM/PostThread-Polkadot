import { signIn, getCsrfToken, getProviders, signOut, useSession } from 'next-auth/react'
import SocialLoginSVG from '../../components/Buttons/SocialLoginSVG'
import { useToasts } from 'react-toast-notifications'

const Signin = ({ csrfToken, providers }) => {

    const { addToast } = useToasts()
    const { data: session } = useSession(null)

    async function signUser(providerId) {
        const response = await linkUser(providerId)
        switch (response.status_code) {
            case 200:
                addToast("Account successfully connected", {
                    appearance: 'success',
                    autoDismiss: true,
                })
        }
    }


    const linkUser = async (providerId) => {
        // const res = await signIn(providerId, { callbackUrl: '/' })
        await signIn(providerId)
        // if (session) {
        //     const response = await fetch(`api/user/link?` + new URLSearchParams({
        //         account_type: username,
        //         account_value: password,
        //         user_msa_id: profile_pic,
        //         wait_for_inclusion: true
        //     }), {
        //         method: 'POST',
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json'
        //         }
        //     })
        //     const data = await response.json()
        //     return data
        // }
    }

    return (
        <div className="h-full w-full py-16 px-4">
            <div className="flex flex-col items-center justify-center">
                <div className="bg-white border-primary shadow border-2 rounded-md lg:w-1/3  md:w-1/2 w-full p-10 mt-16">
                    <p tabIndex="0" className="focus:outline-none text-2xl font-extrabold leading-6 text-inherit">Connect your accounts to earn rewards!</p>
                    {
                        providers &&
                        Object.values(providers).map(provider => (
                            <div key={provider.name} className="mb-0">
                                <button onClick={() => linkUser(provider.id)} className="py-3.5 px-4 border rounded-lg border-primary-focus flex items-center w-full mt-4">
                                    <SocialLoginSVG type={provider.name} />
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>
            {
                session &&
                <>
                    <p style={{ marginBottom: '10px' }}> Welcome, {session.user.name ?? session.user.email}</p> <br />
                    <img src={session.user.image} alt="" />
                    <p>{JSON.stringify(session)}</p>
                    <button className='bg-primary-focus text-white font-bold py-2 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:shadow-outline' onClick={() => signOut()}>
                        Sign out
                    </button>
                </>
            }

        </div>
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