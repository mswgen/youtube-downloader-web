// Dependency
const express = require('express');
const ytdl = require('ytdl-core');
const bodyParser = require('body-parser');

// Variables
const PORT = process.env.PORT || 5000;

// App
const app = express();

// Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// Route
app.get('/', async (req, res) => {
  res.send('asdf')
});

app.get('/process', async (req, res) => {
  let { url } = req.query;
  let videoArr = [];
  let audioArr = [];

  if (!url)
    return res.send(`<script>alert("유효하지 않은 url입니다");location.href='/';</script>`);
  url = youtube_parser(url);
  if (url == false)
    return res.send(`<script>alert("유효하지 않은 url입니다");location.href='/';</script>`);

  ytdl.getInfo(url).then(info => {
    info.formats.map(createCB('video', videoArr, info));
    info.formats.map(createCB('audio', audioArr, info));

    

    res.render('result', {
      videoArr,
      audioArr,
      video: {
        thumbnail: `https://i.ytimg.com/vi/${url}/hqdefault.jpg`,
        title: info.videoDetails.title,
        description: info.videoDetails.description,
        date: info.videoDetails.publishDate,
        like: info.videoDetails.likes,
        dislike: info.videoDetails.dislikes,
      },
      author: {
        name: info.videoDetails.author.name
      }
    });
  });
});



app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
})

function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
}

function createCB(type, arr, info) {
  if (type == 'video') {
    const cb = 
    /**
     * @param {ytdl.videoFormat} format 
     */
    format => {
      if (arr.length > 5)  return;
      if (format.hasVideo && !format.hasAudio) {
        arr.push({
          title: info.videoDetails.title,
          url: format.url,
          fps: format.fps,
          quality: format.qualityLabel,
          container: format.container,
        })
      }
    }
    return cb;
  } else {
    const cb = 
    /**
     * @param {ytdl.videoFormat} format 
     */
    format => {
      if (arr.length > 5)  return;
      if (!format.videoCodec && format.hasAudio) {
        arr.push({
          title: info.videoDetails.title,
          url: format.url,
          quality: format.audioBitrate,
          container: format.container,
        });
      }
    }
    return cb;
  }
}