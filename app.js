const express = require('express');
const app = express();

const { TwitterBot } = require('./twitter-bot');

const PORT = 3000;

const twitterBot = new TwitterBot({
    consumer_key: 'uk0MOLxVRHKjwAtt2sBb7PYgQ',
    consumer_secret: 'TxEDzgfaUJBWjipuoJkdZEAg5Og6oUqMNAjYbR9vZGaqFKVmaV',
    access_token: '316918910-pMxDwxgO03zeiPCf5bOui9eI8KFdPSXsXj9Ub1yN',
    access_token_secret: 'NvluVm6RqcJIG5yqD6iBIVrgqbjqC3PpX66oJqLJz2oar'
})

app.get('/', (req,res,nex) => {
    res.send('welcome to twitter bot brohh zzzsuerrr123');
});

app.get('/adminProfile', async(req,res,nex) => {
    const admin = await twitterBot.getAdminUserInfo();
    res.json(admin);
});

app.listen(PORT, () => console.log('server is listening bro to port'));

