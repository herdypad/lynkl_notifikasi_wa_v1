const express = require('express');
const CryptoJS = require("crypto-js");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

let client;
let qrCodeData = null;
let isReady = false;

async function initClient() {
    console.log('🚀 Initializing WhatsApp Client with whatsapp-web.js...');
    
    try {
        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './auth_info_baileys'
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        console.log('📱 Setting up WhatsApp Client event listeners...');

        client.on('qr', (qr) => {
            console.log('📱 QR Code generated, ready for scanning');
            qrcode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('❌ Error generating QR code:', err);
                    return;
                }
                qrCodeData = url;
                console.log('✅ QR Code converted to data URL');
            });
        });

        client.on('ready', () => {
            console.log('✅ WhatsApp Client is ready!');
            isReady = true;
            qrCodeData = null;
        });

        client.on('authenticated', () => {
            console.log('✅ Client is authenticated!');
            qrCodeData = null;
        });

        client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failure:', msg);
            isReady = false;
        });

        client.on('disconnected', (reason) => {
            console.log('🔌 Client was disconnected:', reason);
            isReady = false;
            qrCodeData = null;
            console.log('🔄 Attempting to reconnect...');
            setTimeout(initClient, 5000);
        });

        console.log('⏳ Starting WhatsApp Client initialization...');
        await client.initialize();
        
    } catch (error) {
        console.error('❌ Error initializing client:', error);
        setTimeout(initClient, 5000); // Retry after 5 seconds
    }
}

function saveBase64Image(base64Data, outputPath) {
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image data');
    }
    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(outputPath, buffer);
}

console.log('🌟 Starting WhatsApp Notification API with whatsapp-web.js...');
console.log('📂 Current working directory:', __dirname);
initClient();

// Redirect URL endpoint
app.get('/redirect', async (req, res) => {
    const url = req.query.url || 'wa.link/5g7b1o';
    const number = '6282217417425';
    const message = "hallo_ada_orderan_dari_lynk";

    if (isReady) {
        try {
            const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
            await client.sendMessage(chatId, message);
        } catch (err) {
            console.error('❌ Error sending message:', err);
        }
    }
    
    const redirectUrl = url.startsWith('http') ? url : `https://${url}`;
    res.send(`
        <html>
        <head>
            <meta http-equiv="refresh" content="2;url=${redirectUrl}">
            <title>Redirecting...</title>
        </head>
        <body>
            <h2>Order Sent Successfully!</h2>
            <p>You will be redirected to <a href="${redirectUrl}">${url}</a> in 2 seconds...</p>
            <p>If not redirected automatically, <a href="${redirectUrl}">click here</a></p>
        </body>
        </html>
    `);
});

// Login endpoint with QR scan
app.get('/login', (req, res) => {
    if (isReady) {
        return res.send(`
            <html>
            <head>
            <script>
                setTimeout(() => {
                    location.reload();
                }, 2000);
            </script>
            </head>
            <body>
            <h2>✅ WhatsApp is Ready!</h2>
            <p>You are successfully logged in to WhatsApp.</p>
            <p>You can now send messages through the API.</p>
            <a href="/status">Check Status</a>
            </body>
            </html>
        `);
    }
    
    if (qrCodeData) {
        return res.send(`
            <html>
            <head>
            <script>
                setTimeout(() => {
                    location.reload();
                }, 2000);
            </script>
            </head>
            <body>
            <h2>Scan QR Code to Login</h2>
            <img src="${qrCodeData}" alt="QR Code" style="max-width: 512px;" />
            <p>Refresh the page if QR code doesn't update</p>
            <p>Page will auto-refresh every 2 seconds</p>
            </body>
            </html>
        `);
    }
    
    // If no QR code yet, return HTML that will auto-refresh
    return res.send(`
        <html>
        <head>
        <script>
            setTimeout(() => {
                location.reload();
            }, 1000);
        </script>
        </head>
        <body>
        <h2>Initializing WhatsApp Connection...</h2>
        <p>Waiting for QR code...</p>
        <p>Page will refresh automatically</p>
        </body>
        </html>
    `);
});

// Logout endpoint
app.get('/logout', async (req, res) => {
    try {
        if (client) {
            await client.logout();
            await client.destroy();
        }
        
        // Remove auth folder
        try {
            fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
        } catch (e) {
            console.log('Auth folder already removed or not found');
        }
        
        isReady = false;
        qrCodeData = null;
        
        // Reinitialize client
        setTimeout(initClient, 1000);
        
        res.json({ status: 'logged_out' });
    } catch (error) {
        console.error('❌ Error during logout:', error);
        res.status(500).json({ error: error.message });
    }
});

// Status check endpoint
app.get('/status', (req, res) => {
    res.json({ 
        status: 'ok',
        whatsapp_ready: isReady,
        has_qr: !!qrCodeData
    });
});

// Webhook endpoint for Lynk with phone number and merchant key in URL
app.post("/webhook/lynk/:phoneNumber/:merchantKey", async (req, res) => {
    try {
        console.log('📥 Webhook received from Lynk');
        console.log('📋 Headers:', req.headers);
        console.log('📋 Body:', JSON.stringify(req.body, null, 2));
        
        // Ambil phone number dan merchant key dari URL parameter
        const phoneNumber = req.params.phoneNumber;
        const merchantKey = req.params.merchantKey;
        console.log('📱 Phone Number from URL:', phoneNumber);
        console.log('🔑 Merchant Key from URL:', merchantKey);
        
        // Ambil signature dari header (cek berbagai kemungkinan nama header)
        const receivedSignature = req.headers['x-lynk-signature'] || 
                                 req.headers['x-signature'] || 
                                 req.headers['signature'] ||
                                 req.body.signature;
        
        // Untuk debugging, log semua kemungkinan signature
        console.log('🔍 Checking signatures:');
        console.log('- x-lynk-signature:', req.headers['x-lynk-signature']);
        console.log('- x-signature:', req.headers['x-signature']);
        console.log('- signature:', req.headers['signature']);
        console.log('- body.signature:', req.body.signature);

        // Ambil data dari request body
        const { event, data } = req.body;
        
        console.log(`📋 Processing all events: ${event}`);

        // Kirim notifikasi WhatsApp untuk SEMUA event
        if (isReady) {
            // Gunakan phone number dari URL parameter
            console.log('📱 Using phone number from URL:', phoneNumber);
            let message = '';

            // Format pesan berdasarkan jenis event
            if (event === 'payment.received') {
                try {
                    const { message_data, message_id } = data;
                    const { refId, totals, customer } = message_data;
                    const { grandTotal } = totals;

                    message = `🎉 PEMBAYARAN DITERIMA!\n\n` +
                             `💰 Jumlah: Rp ${grandTotal.toLocaleString('id-ID')}\n` +
                             `📋 Ref ID: ${refId}\n` +
                             `👤 Customer: ${customer.name}\n` +
                             `📧 Email: ${customer.email}\n` +
                             `📱 Phone: ${customer.phone}\n` +
                             `⏰ Waktu: ${message_data.createdAt}`;
                } catch (err) {
                    message = `🎉 PEMBAYARAN DITERIMA!\n\n` +
                             `📄 Raw Data: ${JSON.stringify(data, null, 2)}`;
                }
            } else if (event === 'test_event') {
                message = `🧪 TEST WEBHOOK BERHASIL!\n\n` +
                         `📋 Event: ${event}\n` +
                         `💬 Message: ${data.message || 'No message'}\n` +
                         `⏰ Timestamp: ${data.timestamp ? new Date(data.timestamp).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}`;
            } else {
                // Untuk event lainnya, kirim data mentah dalam format yang rapi
                message = `📨 WEBHOOK EVENT: ${event}\n\n` +
                         `📄 Data:\n${JSON.stringify(data, null, 2)}\n\n` +
                         `⏰ Received: ${new Date().toLocaleString('id-ID')}`;
            }

            try {
                const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
                await client.sendMessage(chatId, message);
                console.log(`✅ WhatsApp notification sent for event: ${event}`);
            } catch (err) {
                console.error('❌ Error sending WhatsApp message:', err);
            }
        } else {
            console.log('⚠️ WhatsApp not ready, notification not sent');
        }

        // Validasi signature hanya untuk payment.received (jika ada)
        if (event === 'payment.received' && receivedSignature) {
            try {
                const { message_data, message_id } = data;
                const { refId, totals } = message_data;
                const { grandTotal } = totals;

                // Merchant key dari URL parameter
                console.log('🔑 Using merchant key from URL:', merchantKey);

                // Validasi signature sesuai dokumentasi Lynk
                const signatureString = grandTotal.toString() + refId + message_id + merchantKey;
                const calculatedSignature = CryptoJS.SHA256(signatureString).toString();

                if (calculatedSignature !== receivedSignature) {
                    console.error("❌ Invalid signature");
                    console.log(`Expected: ${calculatedSignature}`);
                    console.log(`Received: ${receivedSignature}`);
                    return res.status(401).json({ error: "Unauthorized: Invalid signature" });
                }
                console.log('✅ Signature validated successfully');
            } catch (err) {
                console.log('⚠️ Error validating signature, but processing anyway:', err.message);
            }
        }

        // Response sukses untuk semua event
        res.status(200).json({ 
            status: "ok", 
            message: `Webhook processed successfully for event: ${event}`,
            event: event,
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error("❌ Webhook error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Send message endpoint
app.get('/send', async (req, res) => {
    const number = req.query.nm;
    const message = req.query.m;
    
    if (!isReady) {
        return res.status(400).json({ error: 'WhatsApp not ready' });
    }
    
    if (!number || !message) {
        return res.status(400).json({ error: 'nm and m query parameters required' });
    }
    
    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ status: 'sent', number, message });
    } catch (err) {
        console.error('❌ Error sending message:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`🚀 WhatsApp Notification API (whatsapp-web.js) is running on port ${PORT}`);
    console.log(`📡 Access login at: http://localhost:${PORT}/login`);
    console.log(`📊 Check status at: http://localhost:${PORT}/status`);
    console.log(`📤 Send message: http://localhost:${PORT}/send?nm=NUMBER&m=MESSAGE`);
    console.log('===============================================');
});
