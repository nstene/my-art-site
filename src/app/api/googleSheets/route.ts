import { google } from 'googleapis';

// Define the required scopes and the Google Sheets range
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = '1pG3gYKwWoBr3zRNwajz7recXSjYWL036J4d3TDBR-qM';  // Replace with your Google Sheets ID
const RANGE = 'A2:G';  // Replace with your desired sheet range

// Path to your service account credentials file
const KEY_PATH = "C:\\Users\\natha\\Downloads\\ouroboros-nathan-website-6a3f32d230d7.json";

// Google Sheets API function to get data
export async function GET() {
    try {
        // Authenticate using the service account
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: SCOPES,
        });

        // Initialize Google Sheets API client
        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch data from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const dreams = response.data.values;
        if (dreams) {
            const analyzedData = analyzeDreams(dreams);
            // Respond with the data from the Google Sheet
            return new Response(JSON.stringify(analyzedData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            return new Response('No content available', { status: 204 });
        }

    } catch (error: unknown) {
        if (error instanceof Error) {
            // Now `error` is typed as an instance of `Error`, which has a `message` property
            console.error('Error accessing Google Sheets:', error);
            return new Response(`Error: ${error.message || 'Unknown error'}`, { status: 500 });
        } else {
            // Handle the case where the error is not an instance of `Error`
            console.error('Unknown error type:', error);
            return new Response('Unknown error', { status: 500 });
        }
    }
}

function parseDate(dateStr: string) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // JavaScript months are 0-indexed
}


function analyzeDreams(dreams: string[][]): {
    analysis: Record<string, { frequency: number, coOccurrences: Record<string, number> }>;
    metadata: {
        dreamCount: number;
        minDate: string | null;
        maxDate: string | null;
    };
} {
    const analysis: Record<string, { frequency: number, coOccurrences: Record<string, number> }> = {};

    // Extract valid dates for metadata
    const dates = dreams
        .map(row => parseDate(row[0])) // Convert the first column to Date objects
        .filter(date => !isNaN(date.getTime())); // Filter out invalid dates

    const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(date => date.getTime()))) : null;
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(date => date.getTime()))) : null;
    
    // Perform analysis
    for (const row of dreams) {
        const people = (row[4] || '') // Assuming names are in column 4
            .split(',')
            .map(name => name.trim().toLowerCase())
            .filter(name => name); // Remove empty strings

        // Update frequencies and co-occurrences
        for (let i = 0; i < people.length; i++) {
            const person = people[i];
            if (!analysis[person]) {
                analysis[person] = { frequency: 0, coOccurrences: {} };
            }
            analysis[person].frequency++;

            for (let j = 0; j < people.length; j++) {
                if (i !== j) {
                    const coPerson = people[j];
                    analysis[person].coOccurrences[coPerson] =
                        (analysis[person].coOccurrences[coPerson] || 0) + 1;
                }
            }
        }
    }

    const metadata = {
        dreamCount: dreams.length,
        minDate: minDate ? minDate.toISOString().split('T')[0] : null,
        maxDate: maxDate ? maxDate.toISOString().split('T')[0] : null,
    };

    return { analysis, metadata };
}