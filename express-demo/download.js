const https = require('https');
const fs = require('node:fs');
const { parse } = require('path');
const options = {
  hostname: 'assetdelivery.roblox.com',
  port: 443,
  path: '/v2/assetId/36214639?skipSigningScripts=false',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Accept-Encoding': 'json',
    'Roblox-Place-Id': '0',
    'AssetType': 'Image',
    'Accept': 'Gr',
    'AssetFormat': 'file',
    'Roblox-AssetFormat': 'decal'
  }
};

https.get(options, (res) => {
  let data = '';

  // A chunk of data has been received.
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received.
  res.on('end', () => {
    console.log(JSON.parse(data));
    const parseddata = JSON.parse(data)
    var hahaha = ""
    for (let index = 0; index < parseddata.locations.length; index++) {
        const element = parseddata.locations[index];
        for (let index2 = 0; index2 < element.length; index2++) {
            const element2 = element[index2];
            console.log(element2)
            hahaha = element2.location
            console.log(hahaha)
        }
       // console.log(element)
    }
    //console.log(parseddata.locations)
    https.get(hahaha, (res) => {
        let data2 = '';
      
        // A chunk of data has been received.
        res.on('data', (chunk) => {
            console.log("chunk added")
          data2 += chunk;
          
        });
      fs.writeFileSync()
        // The whole response has been received.
        res.on('end', () => {
            //console.log("FINAL REQ")
          console.log(data2);
       //   fs.writeFileSync('./image.png', JSON.parse(data))
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
