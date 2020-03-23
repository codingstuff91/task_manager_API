const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENGRID_API_KEY)

const sendWelcomeMail = (email,name) =>{
    
    sgMail.send({
        from : 'codingstuff91@gmail.com',
        to : email,
        subject : 'Bienvenue sur codingstuff',
        text : `Bienvenue ${name} sur le site Codingstuff.`
    })
}

module.exports = {
    sendWelcomeMail
}