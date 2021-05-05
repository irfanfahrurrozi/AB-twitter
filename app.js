const express = require('express');
const CronJob = require('cron').CronJob;
const app = express();

const { TwitterBot } = require('./twitter-bot');

const PORT = 3000;


const bot = new TwitterBot({
    consumer_key: 'nMB6M3Dnney5XrJldspQ852Mb',
    consumer_secret: 'zzZW9g4D2ib8zM7Fv6J100Sy2e57v0vX7zKDMJ6XsLLp922cbs',
    access_token: '316918910-Exc5TeNnEVyoqzYDhpCSEG5PwSsOzkuMYU3KfQGg',
    access_token_secret: '60VlBbY4ojdAZbBegqo8Ru0RG4WzdsZ1UfOW4sJcSNJHd',
    triggerWord: 'mas'
    
    //API Fhz useless
    //consumer_key: 'bIZMqQ2O25sArTqmEXYc5uGMm',
    //consumer_secret: 'PnVf08NzMfhdEzgSjUDqf2SckLme7wVc4CR6nhZswvrMyaIrQp',
    //access_token: '316918910-okcKlrmYgg3XIjoyIpT6idS9zrs4G1Fj8l3AyyhH',
    //access_token_secret: 'LuVKDrTqcoSGZ1pNZ13URyVMgawNgPWS7wPCAfCXj4DDU'
})


const job = new CronJob(
    '*/1 * * * * *',
    doJob,
    null,
    false
);


async function doJob() {
    const authenticatedUserId = await bot.getAdminUserInfo();
    const dm = await bot.getDirectMessage(authenticatedUserId);
    // for (const message of dm.events) {
    //     console.log(message.message_create, '<<< msg');
    // }
  
};


app.get('/', (req,res,nex) => {
    res.send('welcome to twitter bot brohh zzzsuerrr123');
});

app.get('/trigger', async(req, res, nex) => {
    job.fireOnTick();
    res.send('job ketrigger ini uy');
});

app.listen(PORT, () => console.log('server is listening bro to port'));

