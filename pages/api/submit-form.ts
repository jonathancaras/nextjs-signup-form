import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';

type ResponseData = {
  message: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, interest } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Initialize the Google Sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];

    // Add a new row with form data
    await sheet.addRow({
      Timestamp: new Date().toISOString(),
      Name: name,
      Email: email,
      Phone: phone || 'N/A',
      Interest: interest || 'N/A',
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({ 
      message: 'Error submitting form. Please try again later.' 
    });
  }
}
