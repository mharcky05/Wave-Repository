const nodemailer = require('nodemailer');

// I-configure ang email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mharckyc21@gmail.com',
        pass: 'gxas tgam ilca hxzv'
    }
});

function sendEmail(to, subject, text) {
    // Maganda at professional na HTML email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                font-family: 'Arial', sans-serif; 
                background-color: #f4f4f4; 
                margin: 0; 
                padding: 20px; 
            }
            .container { 
                max-width: 600px; 
                background: white; 
                margin: 0 auto; 
                border-radius: 10px; 
                overflow: hidden; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
            }
            .header { 
                background: linear-gradient(135deg, #b81d24, #ef232dff); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: bold; 
            }
            .header p { 
                margin: 5px 0 0 0; 
                font-size: 16px; 
                opacity: 0.9; 
            }
            .content { 
                padding: 30px; 
                color: #333; 
            }
            .verification-box { 
                background: #f8f9fa; 
                border: 2px dashed #4a7c59; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 20px 0; 
                text-align: center; 
            }
            .verification-code { 
                font-size: 32px; 
                font-weight: bold; 
                color: #2c5530; 
                letter-spacing: 3px; 
                margin: 15px 0; 
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px; 
                text-align: center; 
                color: #666; 
                font-size: 14px; 
                border-top: 1px solid #e9ecef; 
            }
            .button { 
                display: inline-block; 
                background: #4a7c59; 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 10px 0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>L'ESCAPADE RESORT</h1>
                <p>Your Private Villa Experience</p>
            </div>
            
            <div class="content">
                <h2>Welcome to L'Escapade Resort! </h2>
                
                <p>Hello <strong>${text.match(/Kamusta (.+?),/)?.[1] || 'Guest'}</strong>,</p>
                
                <p>Thank you for signing up with L'Escapade Resort booking system! We're excited to have you as our guest.</p>
                
                <div class="verification-box">
                    <h3>Email Verification Required</h3>
                    <p>Please verify your email address using the code below:</p>
                    <div class="verification-code">${text.match(/Verification Code: (\w+)/)?.[1] || 'N/A'}</div>
                    <p>Enter this code in the verification section to complete your registration.</p>
                </div>
                
                <p>If you didn't create an account, please ignore this email.</p>
                
                <p>Best regards,<br>
                <strong>The L'Escapade Resort Team</strong></p>
            </div>
            
            <div class="footer">
                <p>L'ESCAPADE RESORT • Private Villa Experience</p>
                <p>📍 Resort Location • 📞 Contact: +63 969 326 6380</p>
                <p>© 2025 L'Escapade Resort. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: '"L\'Escapade Resort" <mharckyc21@gmail.com>',
        to: to,
        subject: subject,
        html: htmlTemplate,  // ✅ Gamitin ang HTML template
        text: text  // Fallback for plain text
    };

    console.log('📧 SENDING BEAUTIFUL EMAIL TO:', to);
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error sa pagpadala ng email:', error);
        } else {
            console.log('✅ Successful ang pagpadala ng beautiful email!');
        }
    });
}

module.exports = { sendEmail };