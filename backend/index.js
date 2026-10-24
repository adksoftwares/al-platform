const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Initialize Express App
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check / Root route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 50px auto; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; text-align: center;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">🚀 AlApp Backend Server</h2>
            <p style="color: #22c55e; font-weight: bold; margin-bottom: 16px;">Status: Online & Ready</p>
            <p style="color: #64748b; font-size: 14px;">Webhooks endpoint: <code>/payhere/notify</code></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #334155; font-size: 14px;">Looking for the web frontend? Open <a href="http://localhost:5173" style="color: #3b82f6; text-decoration: underline;">http://localhost:5173</a></p>
        </div>
    `);
});

// TODO: Replace this with your actual service account key JSON file
// You can download this from Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// const serviceAccount = require('./firebase-adminsdk.json');

// Initialize Firebase Admin (Uncomment when you add the JSON file)
/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com" // Replace with your actual Realtime DB URL
});
*/

// Your PayHere Merchant Secret (From the PayHere Dashboard)
const MERCHANT_SECRET = 'MTg5MzIzMDM0NDIxN...'; // IMPORTANT: Put your full secret here
const MERCHANT_ID = '1236265';

app.post('/payhere/notify', async (req, res) => {
    try {
        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            custom_1 // This will contain the Firebase User ID we passed from the app
        } = req.body;

        // 1. Verify it's for our merchant ID
        if (merchant_id !== MERCHANT_ID) {
            console.error('Invalid merchant ID');
            return res.status(400).send('Invalid merchant ID');
        }

        // 2. Generate the MD5 signature locally to verify PayHere sent it
        const hashedSecret = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
        
        // Format: merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(payhere_secret))
        const sigString = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret;
        
        const generatedSig = crypto.createHash('md5').update(sigString).digest('hex').toUpperCase();

        // 3. Compare signatures
        if (generatedSig !== md5sig) {
            console.error('Signature mismatch! Potential spoofing attack.');
            console.error(`Expected: ${generatedSig}, Got: ${md5sig}`);
            return res.status(400).send('Invalid signature');
        }

        // 4. Check if payment was successful (status_code 2 means success)
        if (status_code === '2' || status_code === 2) {
            const userId = custom_1;
            
            if (!userId) {
                console.error('No User ID provided in custom_1');
                return res.status(400).send('User ID missing');
            }

            console.log(`Payment successful for user: ${userId}. Upgrading to Premium...`);

            // 5. Update Firebase Realtime Database
            // Uncomment the below lines once you have added your Firebase Service Account JSON
            /*
            const db = admin.database();
            const userRef = db.ref(`users/${userId}`);
            await userRef.update({
                isPremium: true,
                premiumValidUntil: Date.now() + (30 * 24 * 60 * 60 * 1000) // Example: 30 days
            });
            */
            
            console.log('Firebase Database updated successfully.');
            
            // Return 200 OK to PayHere so they know we received the webhook
            return res.status(200).send('Payment success recorded.');
        } else {
            console.log(`Payment failed or pending. Status Code: ${status_code}`);
            return res.status(200).send('Ignored non-success status');
        }

    } catch (error) {
        console.error('Error processing PayHere webhook:', error);
        return res.status(500).send('Internal Server Error');
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`PayHere Webhook Server running on port ${PORT}`);
    console.log(`Waiting for POST requests at http://localhost:${PORT}/payhere/notify`);
});