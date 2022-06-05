function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
console.log(hex2a("0x2268656c6c6f2c626c61682c626c65747222"));
console.log("subreddit,author,title,selftext,url,is_nsfw" == "subreddit,author,title,selftext,url,is_nsfw")

import { stringToU8a, u8aToHex, hexToString } from '@polkadot/util';

// Convert message, sign and then verify
console.log(stringToU8a("subreddit,author,title,selftext,url,is_nsfw" == "subreddit,author,title,selftext,url,is_nsfw"));
console.log(u8aToHex(stringToU8a("subreddit,author,title,selftext,url,is_nsfw" == "subreddit,author,title,selftext,url,is_nsfw")));
console.log(hexToString("0x2268656c6c6f2c626c61682c626c6574722"));
