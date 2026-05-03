const { Resend } = require('resend');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { email, q1, q2, q3, skinType } = data;

  if (!email || !q1 || !q2 || !q3 || !skinType) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { statusCode: 400, body: 'Invalid email address' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmails = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2].filter(Boolean);

  try {
    await resend.emails.send({
      from: 'Mivera <hello@mivera.skin>',
      to: adminEmails,
      subject: 'New Skin Assessment Submission',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1A1A1A;">
          <h2 style="color: #4DB6AC;">New submission</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Skin type assigned:</strong> ${skinType}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Q1 — Which sounds most like your skin right now?</strong><br>${q1}</p>
          <p><strong>Q2 — How long has this been happening?</strong><br>${q2}</p>
          <p><strong>Q3 — What have you done about it?</strong><br>${q3}</p>
        </div>
      `
    });

    await resend.emails.send({
      from: 'Mivera <hello@mivera.skin>',
      to: [email],
      subject: 'Welcome to Mivera',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #1A1A1A; line-height: 1.7;">
          <p>Welcome.</p>
          <p>You just did something most skincare brands never ask for. You told us what's actually happening with your skin.</p>
          <p>We'll reach out with your skin type shortly. After that, we want to hear more from you. Mivera is being built around women like you, and we'd rather understand your skin before we build anything for it.</p>
          <p>This is not a newsletter. It's a conversation.</p>
          <br>
          <p>Talk soon,<br>The Mivera Team</p>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Resend error:', err);
    return { statusCode: 500, body: 'Email send failed' };
  }
};
