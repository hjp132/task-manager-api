const sgMail = require('@sendgrid/mail');



sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name, _id) => {
    sgMail.send({
        to: email,
        from: 'harrypalmer889@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app. Your unique ID is ${_id}. Please remember this.`
        
    })
};

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'harrypalmer889@gmail.com',
        subject: 'Sorry to see you go',
        text: `Googbye ${name}. I hope to see you back sometime soon.`
    })
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};