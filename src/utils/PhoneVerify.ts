import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const sendSMSOTP = async (phoneNumber:string, otp: string) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP code for Scholarific is ${otp}. DO NOT share this code with anyone.`,
            from: '+14158623778',
            to: `${phoneNumber}`
        });
        console.log('OTP sent:', message.sid);
    } catch (error) {
        console.error('Failed to send OTP via WhatsApp:', error);
    }
};

export default sendSMSOTP;

