var request = require('request');
var Twitter = require('twitter');
var querystring = require('querystring');
var client = new Twitter(require('./config.js'));

function tweetOrlyCover(twitHandle, url) {
    console.log('Creating the coverpage.', url);
    request.get({ url:url, encoding:null }, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                client.post('media/upload', { media: body }, function (error, media, response) {
                    if (error) {
                        console.error('Error from media/upload: ' + JSON.stringify(error));
                        return;
                    }

                    console.log('Cover page is uploaded');

                    var status = {
                        status: `@${twitHandle}`,
                        media_ids: media.media_id_string
                    };

                    client.post('statuses/update', status, function (error, tweet, response) {
                        if (!error) {
                            console.log('Tweeted ok');
                        }
                    });

                });

            } else {
                console.error(err, response.statusCode);
            }
        });
}

function getRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.stream('statuses/filter', { track: '@OreillyCover /orly' }, function (stream) {
    stream.on('data', function (tweet) {
        console.log(JSON.stringify(tweet));
        var values = tweet.text.replace('@OreillyCover /orly', '').split(';'); // [title, topText, author]
        var query = querystring.stringify({
            title: values[0],
            top_text: values[1],
            author: values[2],
            image_code: getRand(1, 40),
            theme: getRand(0, 16)
        });
        var URL = 'https://orly-appstore.herokuapp.com/generate?' + query;
        tweetOrlyCover(tweet.user.name, URL);
    });

    stream.on('error', function (error) {
        throw error;
    });
});

