const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const stream = require('stream')
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const signature = require('cookie-signature');

const mongoose = require('mongoose');
const { generateUrlMapping } = require('./helper');
const path = require('path');
const { Users, Tokens } = require('./schema.index');
const session = require('express-session');
const app = express();
const RedisStore = require('connect-redis').default;
const redisClient = require('./redis.init');

app.set('trust proxy', 1);
dotenv.config();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    credentials: true, origin: [
        "http://localhost:3000",
        "http://localhost:4000",
        "https://freetrade.tk",
        "https://www.freetrade.tk",
        'https://48e4-203-187-238-40.ngrok-free.app'
    ],
}));
app.use(express.static(path.join(__dirname, 'public', 'out')));

mongoose.connect('mongodb://127.0.0.1:27017/youtube', { useNewUrlParser: true }).then(() => { console.log('MongoDB Connected.') }).catch(err => console.log(err));

const { PORT, GOOGLE_USER_INFO_URL, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REDIRECT_URL } = process.env;

const oAuthClient = new OAuth2Client({
    clientId: YOUTUBE_CLIENT_ID,
    clientSecret: YOUTUBE_CLIENT_SECRET,
    redirectUri: YOUTUBE_REDIRECT_URL,
});

// Set up AWS SDK v3
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

const redisStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
});

//Configure session middleware
app.use(session({
    store: redisStore,
    secret: 'secret$%^134',
    resave: false,
    name: 'f.session',
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge: 1000 * 60 * 10 // session max age in miliseconds
    }
}));

// Set up Multer with custom storage
const multerUpload = multer({
    storage: multer.memoryStorage(),
});

app.get('/_healthz', (req, res) => {
    return res.status(200).send({ message: "ok" })
});

app.post('/google-login', async (req, res) => {
    const { access_token } = req.body;
    let UserApiResp = await axios.get(`${GOOGLE_USER_INFO_URL}?access_token=${access_token}`);
    const userData = UserApiResp.data;
    const params = {
        Bucket: 'youtube-manager',
        Prefix: userData.id
    };
    req.session.user = userData;
    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    if (data.Contents && data.Contents.length) {
        const signedURLs = [];
        const videosByName = data.Contents.map((item) => {
            const commandParams = {
                Bucket: 'youtube-manager',
                Key: `${userData.id}/${item.Key}`
            };
            const getObjectCommand = new GetObjectCommand(commandParams);
            signedURLs.push(getSignedUrl(s3Client, getObjectCommand, { expiresIn: 60 }))
            return item.Key
        });
        // Generate a signed URL for the getObjectCommand
        const signedUrl = await Promise.all(signedURLs);
        let apiResp = generateUrlMapping(signedUrl, videosByName)
        return res.json({ videos: apiResp, user: userData });
    } else {
        res.cookie('f.session', req.sessionID, { "httpOnly": true, "path": "/" });
        return res.json({ videos: [], user: userData });
    }

})
const ensureAuthenticated = async (req, res, next) => {
    let sessionId = req.cookies['f.session']
    sessionId = decodeURIComponent(sessionId).slice(2).split(".")[0];
    let isUserAuthenticated = await redisClient.get(`sess:${sessionId}`);
    if (isUserAuthenticated) {
        isUserAuthenticated = JSON.parse(isUserAuthenticated);
        req.user = isUserAuthenticated.user;
        next();
    } else {
        return res.status(401).send({ message: "User Not Authenticated" });
    }
}
app.get('/videos', ensureAuthenticated, async (req, res) => {
    try {
        const user = req.user;
        const userId = user.id.toString();
        const params = {
            Bucket: 'youtube-manager',
            Prefix: userId
        };
        const command = new ListObjectsV2Command(params);
        const data = await s3Client.send(command);

        const signedURLs = [];

        if (data.Contents && data.Contents.length) {
            let videosByName = data.Contents.map((item) => {
                const commandParams = {
                    Bucket: 'youtube-manager',
                    Key: item.Key
                };
                const getObjectCommand = new GetObjectCommand(commandParams);
                signedURLs.push(getSignedUrl(s3Client, getObjectCommand, { expiresIn: 60 }))
                return item.Key
            });
            // Generate a signed URL for the getObjectCommand
            const signedUrl = await Promise.all(signedURLs);
            let apiResp = generateUrlMapping(signedUrl, videosByName)
            res.json({ data: apiResp, message: "Data Fetched Successfully" });
        } else {
            res.json({ data: [], message: "No Videos Found", success: true })
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/auth', async (req, res) => {
    const code = req.query.code;
    try {
        let { tokens } = await oAuthClient.getToken(code);
        oAuthClient.setCredentials(tokens);
        let oauth2 = google.oauth2({
            auth: oAuthClient,
            version: 'v2'
        });
        let { data } = await oauth2.userinfo.get();
        let isExists = await Users.findOne({ email: data.email });
        if (!isExists) {
            let newUser = new Users({
                name: data.name,
                email: data.email,
                google_id: data.id
            });
            let userData = await newUser.save();
            let newToken = new Tokens({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: tokens.expiry_date,
                user_id: userData._id
            });
            let tokenData = await newToken.save();
            return res.json({ message: 'Authentication successful', data: { userData, tokenData } });
        }
    } catch (error) {
        console.log(error, "---error----")
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.post('/user', async (req, res) => {
    const { email, id, given_name, name, picture } = req.body;
    let isExists = await Users.findOne({ email });
    if (!isExists) {
        let newUser = new Users({
            name: name,
            email: email,
            google_id: id
        });
        let userData = await newUser.save();
        return res.json({ message: 'Authentication successful', data: userData });
    } else {
        return res.json({ message: 'Authentication successful', data: req.body });
    }
})

app.post('/push-to-youtube', ensureAuthenticated, async (req, res) => {
    try {
        const authorizeUrl = oAuthClient.generateAuthUrl({
            access_type: 'offline',
            scope: ['youtube.upload'],
        });
        return res.redirect(authorizeUrl);
    } catch (error) {
        console.log(error, "---error---")
    }
})
app.post('/youtube', ensureAuthenticated, async (req, res) => {
    try {
        const authUser = req.user;
        let user = await Users.findOne({ email: authUser.email });
        let user_id = user._id;
        let user_token = await Tokens.findOne({ user_id });
        if (!user_token) {
            const authorizeUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['youtube.upload'],
            });
            return res.redirect(authorizeUrl);
        }
        oAuthClient.setCredentials(user_token);

        const youtube = google.youtube({
            version: 'v3',
            auth: oAuthClient,
        });
        const { Body } = await s3Client.send(new GetObjectCommand({
            Bucket: AWS_S3_BUCKET,
            Key: 'testvideo.mov',
        }));

        const youtubeParams = {
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: 'testvideo',
                    description: 'Your Video Description',
                },
                status: {
                    privacyStatus: 'unlisted', // Change to 'public' if you want the video to be public
                },
            },
            media: {
                body: Body
            },
        };

        const youtubeResponse = await youtube.videos.insert(youtubeParams);

        res.json({
            youtube: youtubeResponse.data,
            message: "Video Uploaded Successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/upload', ensureAuthenticated, multerUpload.single('file'), async (req, res) => {
    try {
        const user = req.user;
        const userId = user.id.toString();
        // Pipe the in-memory buffer to the PassThrough stream
        const pass = new stream.PassThrough();

        // Pipe the in-memory buffer to the PassThrough stream
        pass.end(req.file.buffer);

        // Use @aws-sdk/client-s3 to upload the PassThrough stream to S3
        const s3Params = {
            Bucket: 'youtube-manager',
            Key: `${userId}/${req.file.originalname}`, // You can customize the key as per your requirement
            Body: pass,
        };

        const upload = new Upload({
            client: s3Client,
            params: s3Params,
            partSize: 1024 * 1024 * 5,
        });
        upload.on('httpUploadProgress', (progress) => {
            console.log(progress);
        });
        // Event: initiated - triggered when the upload is initiated
        upload.on('initiated', () => {
            console.log('Upload initiated');
        });

        // Event: uploaded - triggered when a part is successfully uploaded
        upload.on('uploaded', (details) => {
            console.log('Part uploaded:', details);
        });

        // Event: completed - triggered when the entire upload is completed
        upload.on('completed', (details) => {
            console.log('Upload completed:', details);
        });

        // Event: failed - triggered if the upload fails
        upload.on('failed', (details) => {
            console.error('Upload failed:', details);
        });

        // Event: paused - triggered when the upload is paused
        upload.on('paused', () => {
            console.log('Upload paused');
        });

        // Event: resumed - triggered when the upload is resumed
        upload.on('resumed', () => {
            console.log('Upload resumed');
        });

        // Event: end - triggered when the entire upload is done (success or failure)
        upload.on('end', () => {
            console.log('Upload finished');
        });

        await upload.done();
        return res.json({
            message: 'Video uploaded successfully.',
            success: true
        });
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Catch-all route to serve 'index.html'
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'out', 'index.html'));

});

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log(`server listening on port ${PORT}`)
})
module.exports = app;
