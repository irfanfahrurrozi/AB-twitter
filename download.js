const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const axios = require('axios');
const fs = require('fs');

const OAuthHelper = ( mediaUrl ) => {
    const oauth = OAuth({
        consumer: {
            key: 'nMB6M3Dnney5XrJldspQ852Mb',
            secret: 'zzZW9g4D2ib8zM7Fv6J100Sy2e57v0vX7zKDMJ6XsLLp922cbs'
        },
        signature_methode: 'HMAC-SHA1',
        hash_function(base_string, key){
            return crypto.createHmac('sha1', key).update(base_string).digest('base64');
        }
    })

    const authorization = oauth.authorize({
        url: mediaUrl,
        method: 'GET',
    }, {
        key: '316918910-Exc5TeNnEVyoqzYDhpCSEG5PwSsOzkuMYU3KfQGg',
        secret: '60VlBbY4ojdAZbBegqo8Ru0RG4WzdsZ1UfOW4sJcSNJHd'
    })

    return oauth.toHeader(authorization);
}

const downloadMedia = async (mediaUrl, fileName) => {
    try {
    
        const authorization = OAuthHelper(mediaUrl);
        const {data} = await axios.get(
            mediaUrl,
            {
                headers: authorization,
                responseType: 'arraybuffer'
            }
        ) 
        fs.writeFileSync(fileName, data);
        return data;

    } catch (error) {
        throw new Error('error from downloading media');
    }
}

module.exports = { downloadMedia };