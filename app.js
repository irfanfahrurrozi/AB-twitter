const express = require('express');
const CronJob = require('cron').CronJob;
const app = express();

const { TwitterBot } = require('./twitter-bot');

const PORT = 3000;


const bot = new TwitterBot({
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: '',
    triggerWord: 'mas'
    
    
})


const job = new CronJob(
    '*/1 * * * * *',
    doJob,
    null,
    false
);


async function doJob() {
    try {
        const authenticatedUserId = await bot.getAdminUserInfo();
        const message = await bot.getDirectMessage(authenticatedUserId);
        
        // for (const message of dm.events) {
        console.log(JSON.stringify(message, null, 2), '<<<<<< ini message nya pake media');
        // }
        if (message.id){
            await bot.tweetMessage(message);
        } else {
            console.log('no tweet post --------xxxx----------')
        }
    } catch (error) {
        console.log(error);
        console.log('---------------ERROR---------------')
    }
    
    
  
};


app.get('/', (req,res,nex) => {
    res.send('welcome to twitter bot brohh zzzsuerrr123');
});

app.get('/trigger', async(req, res, nex) => {
    job.fireOnTick();
    res.send('job ketrigger ini uy');
});

app.listen(PORT, () => console.log('server is listening bro to port'));

