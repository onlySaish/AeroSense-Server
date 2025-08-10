// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { parse } from "json2csv";

// // Create __dirname for ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const writeDataToCSV = (data) => {
//   try {
//     const csv = parse(data);

//     // Go up to server root, then into public/temp
//     const csvFilePath = path.join(__dirname, "..", "..", "public", "data.csv");

//     fs.writeFileSync(csvFilePath, csv);
//     console.log(`Data successfully written to ${csvFilePath}`);
//   } catch (err) {
//     console.error("Error writing data to CSV:", err.message);
//   }
// };

// export { writeDataToCSV };

import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeDataToCSV = (data) => {
  try {
    const csvFilePath = path.join(__dirname, '..', '..', 'public', 'data.csv');
    const opts = { header: !fs.existsSync(csvFilePath) }; // Only add header if file doesn't exist
    const csv = parse(data, opts);

    if (fs.existsSync(csvFilePath)) {
      fs.appendFileSync(csvFilePath, '\n' + csv);
    } else {
      fs.writeFileSync(csvFilePath, csv);
    }

    console.log(`Data successfully written/appended to ${csvFilePath}`);
  } catch (err) {
    console.error('Error writing data to CSV:', err.message);
  }
};

export { writeDataToCSV };
