const Twit = require('twit');
const { downloadMedia } = require('./download');

class TwitterBot {
    constructor(props){
        this.T = new Twit({
            consumer_key: props.consumer_key,
            consumer_secret: props.consumer_secret,
            access_token: props.access_token,
            access_token_secret: props.access_token_secret
        });
        
    this.triggerWord = props.triggerWord;

    }

    getAdminUserInfo = () => { 
        return new Promise((resolve, reject) => {
            this.T.get('account/verify_credentials', { skip_status: true })
                .then(result => {
                    const userId = result.data.id_str;
                    resolve(userId);
                })
                .catch(err => {
                    reject(err);
                })
        })

    }

    getReceivedMessages = (messages, userId ) => {
        return messages.filter(msg => msg.message_create.sender_id !==userId);
    }

    getUnnecessaryMessages = (receivedMessages, trigger) => {
        return receivedMessages.filter(msg => {
            const message = msg.message_create.message_data.text;
            const words = this.getEachWord(message);
            return !words.includes(trigger);
        })
    }

    getTriggerMessages = (receivedMessages, trigger) => {
        return receivedMessages.filter(msg => {
            const message = msg.message_create.message_data.text;
            const words = this.getEachWord(message);
            return words.includes(trigger);
        })
    }

    getEachWord = (message) => {
        let words = [];
        let finalWords = [];
        const separateEnter = message.split('\n');
        separateEnter.forEach(line => words = [...words, ...line.split(' ')]);
        words.forEach(word => {
            const splitComma = word.split(',');
            finalWords = [...finalWords, ...splitComma];  
        });

        
        return finalWords;
    }

    getDirectMessage = (userId) => {
        return new Promise((resolve, reject) => {
            this.T.get('direct_messages/events/list', async(error, data) => {
                try {

                    if(!error) { 
                        let lastMessage = {};
                        const messages = data.events;
                        const receivedMessages = this.getReceivedMessages(messages, userId);
                        const unnecessaryMessages = this.getUnnecessaryMessages(receivedMessages, this.triggerWord);
                        const triggerMessages = this.getTriggerMessages(receivedMessages, this.triggerWord);
                        
                        await this.deleteUnnecessaryMessages(unnecessaryMessages);
                        await this.deleteMoreThan280CharMsgs(triggerMessages);
                        if (triggerMessages[0]) {
                            lastMessage = triggerMessages[triggerMessages.length - 1];
                        }
                        resolve(lastMessage);
                    } else {
                        reject('ada error pas minta dm');
                    }
                    
                } catch (error) {
                    reject(error);
                }
                
            })
        })
    }

    tweetMessage =  (message) => {
        return new Promise(async (resolve, reject) => {
            try {
                    const text = message.message_create.message_data.text;
                    const attachment = message.message_create.message_data.attachment;
                

                    const payLoad={
                        status: text
                }

                if (attachment){ 
                    const shortUrl = attachment.media.url;
                    payLoad.status = text.split(shortUrl)[0];
                    const type = attachment.media.type;
                    let media_url = '';
                    const mediaUrl = attachment.media.media_url;

                    if (type === 'animated_gif'){
                        mediaUrl = media.video_info.variants[0].url;
                    } else if(type === 'video'){
                        mediaUrl = media.video_info.variants[0].url.split('?')[0];
                    } else {
                        mediaUrl = attachment.media.media_url_https;
                    }
                    const splittedUrl = mediaUrl.split('/');
                    const fileName = splittedUrl[splittedUrl.length - 1];

                    console.log(mediaUrl, 'media url <<<<<<<<<<<<');
                    console.log(fileName, 'file Name <<<<<<<<<<<<');
                    console.log('DOWNLOADING MEDIA');


                   await downloadMedia(mediaUrl, fileName);
                     console.log('MEDIA UDAH DI DOWNLOAD')


                } 

                resolve();
                
                // this.T.post('statuses/update', payLoad, (error, data) => {
                //     if(!error) {
                //         console.log('"Berhasil mengirimkan Tweet uwu dengan DM id ${message.id}')
                //         resolve({
                //             message: "Berhasil mengirimkan Tweet uwu dengan DM id ${message.id}"
                //         })
                //     } else {
                //         reject(error);
                //     }
                // })

            } catch (error) {
                reject(error);
            }
            
        })

    }

    deleteUnnecessaryMessages = async (unnecessaryMessages) => {
        if(unnecessaryMessages.length > 1){
            for (let i = 0; i < 3; i++) {
                await this.deleteMessage(unnecessaryMessages[i])
                await this.sleep(2000);
            }
        } else {
            for (const msg of unnecessaryMessages){
                await this.deleteMessage(msg);
                await this.sleep(2000);
            }
        }
    }

    deleteMoreThan280CharMsgs = async (triggerMessages) => {

        try {
            
            let moreThan280 = [];
        for (const [i, msg] of triggerMessages.entries()){
            let text = msg.message_create.message_data.text;
            const attachment = msg.message_create.message_data.attachment;
            if (attachment) {
                const shortUrl = attachment.media.url;
                text = text.split(shortUrl)[0];
            }
            if (text.length > 280) {
                moreThan280.push(msg);
                
                //console.log(triggerMessages,'ini udahh dihapus<<<<<<<<<<<')
                await this.deleteMessage(msg);
                await this.sleep(2000);
                
            }
            if ((i + 1) == 3 ){
                break;
            }

        }
        console.log(moreThan280, 'dapet ini 280 char<<<<<<<<<<')

        for (const msg of moreThan280){
            const idx = triggerMessages.indexOf(msg);
            //console.log(triggerMessages,'ini belum dihapus<<<<<<<<<<<')
            triggerMessages.splice(idx, 1);

        }

        } catch (error) {
            throw (error);

        }
    }

    deleteMessage = (message) => {
        return new Promise((resolve, reject) => {
            this.T.delete('direct_messages/events/destroy', {id:message.id}, (error, data) =>{
                if(!error){
                    const msg = "Pesan dengan id: ${message.id} udah dihapus";
                    console.log(msg);
                    resolve({
                        message: msg,
                        data
                    })
                }else {
                    reject(error);
                }
            })
        })
    }

    sleep = (time) => new Promise (resolve => setTimeout(resolve, time))

}

module.exports = { TwitterBot };