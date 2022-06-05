from praw import reddit
import json
import praw


subreddits = "announcements+Art+AskReddit+askscience+atheism+aww+blog+books+creepy+dataisbeautiful+DIY+Documentaries+EarthPorn+explainlikeimfive+food+funny+Futurology+gadgets+gaming+GetMotivated+gifs+history+IAmA+InternetIsBeautiful+Jokes+LifeProTips+listentothis+mildlyinteresting+movies+Music+news+nosleep+nottheonion+OldSchoolCool+personalfinance+philosophy+photoshopbattles+pics+science+Showerthoughts+space+sports+television+tifu+todayilearned+TwoXChromosomes+UpliftingNews+videos+worldnews+WritingPrompts"

reddit = praw.Reddit(
    client_id="LtjnfEAH_rRdFDbMwILwxw",
    client_secret="04WSBZHCzqm0ElLYMRkmTkmijCCSog",
    password="PosterThreading69",
    user_agent="my user agent",
    username="postthreadbot",
)

f = open('reddit_posts.txt', 'w')
header = "subreddit,author,title,selftext,url,is_nsfw"
json.dump(header, f)
f.write('\n')
for comment in reddit.subreddit(subreddits).stream.submissions():
    d = f"{str(comment.subreddit)},{str(comment.author)},{str(comment.title)},{str(comment.selftext)},{str(comment.url)},{comment.over_18}"
    print(d)
    json.dump(d, f)
    f.write('\n')