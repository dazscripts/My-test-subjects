const fetch = require('node-fetch');

async function fetchRbxDecal() {
  try {
    const response = await fetch('https://rbxdecal.glitch.me/14679125936');
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.text(); // or response.json() if the response is in JSON format
    console.log(data);
  } catch (error) {
    console.error('Failed to fetch from rbxdecal.glitch.me:', error);
  }
}

fetchRbxDecal();
