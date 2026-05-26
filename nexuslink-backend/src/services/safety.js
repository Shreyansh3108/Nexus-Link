import dotenv from 'dotenv';
dotenv.config();

export const checkSafeBrowsing = async (targetUrl) => {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!apiKey) return true; 

  const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  
  const body = {
    client: { clientId: "nexuslink", clientVersion: "1.0.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: targetUrl }]
    }
  };

  try {
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
    const data = await response.json();
    return data.matches ? false : true;
  } catch (error) {
    console.error("Safe Browsing Error:", error);
    return true; 
  }
};