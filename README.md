# PostThread

## About

PostThread is a social media app first and a crypto app second. It is designed so that any user can feel comfortable using the app with no knowledge of crypto what-so-ever, but still have the ability to take control of their digital assets if they choose to. Users are encouraged to grow their profile by contributing, curating and interacting with the site as well as developing a strong following. The scores determined from these are used to distribute tokens each day to all users. We believe this will help to compensate content creators and curators efficiently as well as promote valuable content on PostThread.

## Live Site

You can check out the site for yourself right now at [PostThread.app](https://postthread.app/). Feel free to create a username and make posts and comments. However, this is just a demo so all passwords are set to **password** no matter what you put in.

## Setup

1.  You will need to locally deploy the Frequency parachain by Project Liberty. You can find instructions at their github [here](https://github.com/LibertyDSNP/frequency). This parachain is where all social media data will be stored.
2.  (OPTIONAL) deploy the experimental PostThread parachain [here](https://github.com/iamianM/PostThread-Polkadot/tree/main/backend). However this is only used for transferring tokens, which can be supplemented by just using the Frequency parachain, so this step is not necessary.
3.  Once the chain is running an producing nodes, run all the cells in the [Testing values notebook](https://github.com/iamianM/PostThread-Polkadot/blob/main/reddit-reposter/Testing%20values.ipynb). This will start the IPFS node as well as create starting values for the sqlite database to use.
4.  Run the cells in the [reddit notebook](https://github.com/iamianM/PostThread-Polkadot/blob/main/reddit-reposter/reddit.ipynb). This contains a while loop that will mint the top 100 posts on reddit every hour. It will also listen for new blocks and if it finds new values it will add them to the database.
5.  Start the REST API server with the command `python -m uvicorn rest_api_sql:app --reload --port 5000 --host 0.0.0.0 --forwarded-allow-ips '*' --workers 10` in the reddit-reposter folder. This runs the code which can be found [here](https://github.com/iamianM/PostThread-Polkadot/blob/main/reddit-reposter/rest_api_sql.py). You can checkout the swagger docs at http://67.160.97.38:5000/docs or http://localhost:5000/docs if running locally.
6.  Enter the frontend-tailwinds folder and run `yarn dev` to host the website locally, which can be reached at http://localhost:3000 or you can see the live site at https://postthread.app/
7.  (OPTIONAL) After posts begin to get minted you can pin them to the Crust network by running the [Pin files to Crust network notebook](https://github.com/iamianM/PostThread-Polkadot/blob/main/reddit-reposter/pin-files-to-crust.ipynb)

## Inspiration

Social media is not in our best interest. We are the product and the service. Users create most of the content on these sites and are not rewarded appropriately. We also do not know how these algorithms work. Their incentives lie with advertisers not with its users and these misalign incentives lead to the polarizing climate we live in. They want to keep you on the site as long as possible at any cost and have learned that playing with your emotions is the best way to do that.

Blockchain technology has made it so we no longer have to live in this social media dystopia. The blockchain can be thought of as an open decentralized database, where users can have control and ownership of their data. I believe this will not only allow content creators to be paid more effectively and efficiently, but will open up a world of possibilities where you can actually chose the type of social media experience you want. You will have a say in what they do with your data and have control over how the media is presented to you.

I consider the current state of social media to be a national emergency. The population is growing more polarized, angry and divisive everyday and it think it directly attributable to social media. We live in a new world of big data, which we haven't quite figured out how to navigate yet. Therefore, it opens up an opportunity for these large corporations to take advantage of us. Decentralization allows the people to take control back from the corporations and I think we have created the beginning of an application that can do just that.

## What it does

PostThread is a social media app first and a crypto app second. We hide all the crypto aspects from the user as most people aren't interested in it, but we believe it is important they have the ability to control their data should they choose to. At any time a user can take control of their assets and tokens. Each day users are paid tokens depending on their user and social score. The user score is determined by their contributions to the site such as posting good content, curating the site by voting or linking to their web2 social media accounts. Their social score come strictly from who is following them. Using graph theory we can determine how important a user is in the overall social graph. Centralities are calculated and compared against all other users. Combining these two scores I believe results in a fair distribution of tokens each day and encourages users to contribute, curate and interact with the community.

## How we built it

The frontend was built using NextJS and Tailwinds for styling. The frontend calls a REST API, which was developed using the fastapi library and uses Swagger documentation for easy communication between my partner and I. The backend uses the substate library to communicate with the MRC parachain built by the team at Project Liberty. This chain has not reached the testnet yet so it was deployed locally on a machine I own. Initially it was deployed to aws but the costs were too high.
Using the Reddit API, the top 100 posts are pulled every hour and minted to the blockchain. The posts metadata is uploaded to IPFS with the hash being stored on chain. We also setup an SQLite database to access the data more easily from the REST API. This script also listens for new blocks and will add new data to the database, such as when a user mints a post through the UI.

## Accomplishments that we're proud of

We are proud of having a functioning site that any user can instantly use no matter if they come from a crypto background or not. I am also proud we were able to implement some of the economic ideas we had for the app like the daily rewards and airdrop. I think these are the key to attracting quality users which will lead to the exponential adoption of the platform we believe can happen. We have many more ideas for attracting quality users in the future as well.

## What we learned

The first couple weeks of the hackathon were spent learning about Polkadot, Substrate and Rust as we we're brand new to this space coming from developing Solidity apps. I now feel as though have a strong understanding of the Polkadot system and Substrate library. We transitioned halfway to doing everything through a python REST API using the python substrate library instead of handling everything through the frontend. I found this to be a massive advantage as python is much quicker to develop in. I think continuing with the REST API will lead to a very secure, fast and dependable application.

## What's next for PostThread

We are looking to team up with the developers at Project Liberty, who built the parachain we used. We want to help deploy the parachain to the testnet and work with them to integrate with PostThread. We also will be applying to grants to with hopes to continue working on our social media site full time and potentially find others to work with.
