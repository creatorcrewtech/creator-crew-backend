const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const multer = require('multer');
const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const stream = require('stream')
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const { generateUrlMapping } = require('./helper');
const path = require('path');

dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public', 'out')));


mongoose.connect('mongodb://127.0.0.1:27017/youtube', { useNewUrlParser: true }).then(() => { console.log('mongodb connected') }).catch(err => console.log(err));

const { Users, Tokens } = require('./schema.index');

const { PORT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET, YOUTUBE_API_KEY, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REDIRECT_URL } = process.env;

const oAuthClient = new OAuth2Client({
    clientId: YOUTUBE_CLIENT_ID,
    clientSecret: YOUTUBE_CLIENT_SECRET,
    redirectUri: YOUTUBE_REDIRECT_URL,
});


// Set up Multer with custom storage
const multerUpload = multer({
    storage: multer.memoryStorage(),
});

// Set up AWS SDK v3
const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

app.get('/_healthz', (req, res) => {
    return res.status(200).send({ message: "ok" })
});

app.get('/videos', async (req, res) => {
    try {
        const params = {
            Bucket: 'youtube-manager'
        };
        const command = new ListObjectsV2Command(params);
        const data = await s3Client.send(command);

        const signedURLs = [];
        const videosByName = data.Contents.map((item) => {
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

        await Users.deleteMany({});
        await Tokens.deleteMany({});

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

app.post('/youtube', async (req, res) => {
    try {
        const email = req.cookies.email;
        let user = await Users.findOne({ email });
        let user_id = user._id;
        let user_token = await Tokens.findOne({ user_id });
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

app.post('/upload', multerUpload.single('file'), async (req, res) => {
    try {
        console.log('processing request')

        // Pipe the in-memory buffer to the PassThrough stream
        const pass = new stream.PassThrough();

        // Pipe the in-memory buffer to the PassThrough stream
        pass.end(req.file.buffer);

        // Use @aws-sdk/client-s3 to upload the PassThrough stream to S3
        const s3Params = {
            Bucket: 'youtube-manager',
            Key: req.file.originalname, // You can customize the key as per your requirement
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
