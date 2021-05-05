const Twit = require('twit');

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
                if(!error) { 
                    const messages = data.events;
                    const receivedMessages = this.getReceivedMessages(messages, userId);
                    const unnecessaryMessages = this.getUnnecessaryMessages(receivedMessages, this.triggerWord);
                    const triggerMessages = this.getTriggerMessages(receivedMessages, this.triggerWord);
                    //console.log(JSON.stringify(triggerMessages,null,3), 'unnecessaray message <<<<<<');
                    console.log(JSON.stringify(unnecessaryMessages,null,3), 'unnecessaray message <<<<<<');
                    await this.deleteUnnecessaryMessages(unnecessaryMessages);


                    resolve(data);
                } else {
                    reject('ada error pas minta dm');
                }
            })
        })
    }

    deleteUnnecessaryMessages = async (unnecessaryMessages) => {
        if(unnecessaryMessages.length > 1){
            for (let i = 0; i < 1; i++) {
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