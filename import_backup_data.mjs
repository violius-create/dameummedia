import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import 'dotenv/config';

// Database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Connected to database');

// Read the SQL backup file
const sqlContent = await fs.readFile('/home/ubuntu/upload/20260206_dameum1_DB_Backup.sql', 'utf-8');

// Extract INSERT statements for each board
const extractInsertData = (tableName) => {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES (.+?);`, 's');
  const match = sqlContent.match(regex);
  if (!match) {
    console.log(`No data found for ${tableName}`);
    return null;
  }
  return match[1];
};

// Parse VALUES data into individual records
const parseValues = (valuesString) => {
  const records = [];
  let current = '';
  let inString = false;
  let escapeNext = false;
  let parenDepth = 0;
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      current += char;
      continue;
    }
    
    if (char === "'" && !escapeNext) {
      inString = !inString;
      current += char;
      continue;
    }
    
    if (!inString) {
      if (char === '(') {
        parenDepth++;
        if (parenDepth === 1) {
          current = '';
          continue;
        }
      } else if (char === ')') {
        parenDepth--;
        if (parenDepth === 0) {
          records.push(current);
          current = '';
          continue;
        }
      }
    }
    
    current += char;
  }
  
  return records;
};

// Convert g5_write_live to galleryItems
const importLiveData = async () => {
  console.log('\n=== Importing Concert Live Data ===');
  const valuesData = extractInsertData('g5_write_live');
  if (!valuesData) return;
  
  const records = parseValues(valuesData);
  console.log(`Found ${records.length} records in g5_write_live`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const record of records) {
    try {
      // Split by comma, but respect quotes
      const fields = [];
      let current = '';
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < record.length; i++) {
        const char = record[i];
        
        if (escapeNext) {
          current += char;
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          current += char;
          continue;
        }
        
        if (char === "'") {
          inString = !inString;
          current += char;
          continue;
        }
        
        if (char === ',' && !inString) {
          fields.push(current.trim());
          current = '';
          continue;
        }
        
        current += char;
      }
      fields.push(current.trim());
      
      // Extract relevant fields from g5_write_live
      // Field indices based on CREATE TABLE structure
      const wr_id = fields[0];
      const wr_subject = fields[10]?.replace(/^'|'$/g, '').replace(/\\'/g, "'");
      const wr_content = fields[11]?.replace(/^'|'$/g, '').replace(/\\'/g, "'");
      const wr_link1 = fields[13]?.replace(/^'|'$/g, '').replace(/\\'/g, "'"); // YouTube link
      const wr_datetime = fields[25]?.replace(/^'|'$/g, '');
      
      if (!wr_subject || !wr_link1) {
        skipped++;
        continue;
      }
      
      // Insert into galleryItems
      await connection.execute(
        `INSERT INTO galleryItems (title, description, type, category, mediaUrl, thumbnailUrl, fileKey, uploadedBy, status, createdAt, updatedAt)
         VALUES (?, ?, 'video', 'concert', ?, '', ?, 1, 'published', ?, ?)`,
        [
          wr_subject,
          wr_content || '',
          wr_link1,
          `legacy-live-${wr_id}`,
          wr_datetime || new Date().toISOString().slice(0, 19).replace('T', ' '),
          wr_datetime || new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]
      );
      
      imported++;
      if (imported % 10 === 0) {
        console.log(`Imported ${imported} records...`);
      }
    } catch (error) {
      console.error(`Error importing record:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✓ Imported ${imported} Concert Live records`);
  console.log(`✗ Skipped ${skipped} records`);
};

// Convert g5_write_portfoliodata to galleryItems
const importPortfolioData = async () => {
  console.log('\n=== Importing Making Film Data ===');
  const valuesData = extractInsertData('g5_write_portfoliodata');
  if (!valuesData) return;
  
  const records = parseValues(valuesData);
  console.log(`Found ${records.length} records in g5_write_portfoliodata`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const record of records) {
    try {
      const fields = [];
      let current = '';
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < record.length; i++) {
        const char = record[i];
        
        if (escapeNext) {
          current += char;
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          current += char;
          continue;
        }
        
        if (char === "'") {
          inString = !inString;
          current += char;
          continue;
        }
        
        if (char === ',' && !inString) {
          fields.push(current.trim());
          current = '';
          continue;
        }
        
        current += char;
      }
      fields.push(current.trim());
      
      const wr_id = fields[0];
      const wr_subject = fields[10]?.replace(/^'|'$/g, '').replace(/\\'/g, "'");
      const wr_content = fields[11]?.replace(/^'|'$/g, '').replace(/\\'/g, "'");
      const wr_link1 = fields[13]?.replace(/^'|'$/g, '').replace(/\\'/g, "'");
      const wr_datetime = fields[25]?.replace(/^'|'$/g, '');
      
      if (!wr_subject || !wr_link1) {
        skipped++;
        continue;
      }
      
      await connection.execute(
        `INSERT INTO galleryItems (title, description, type, category, mediaUrl, thumbnailUrl, fileKey, uploadedBy, status, createdAt, updatedAt)
         VALUES (?, ?, 'video', 'film', ?, '', ?, 1, 'published', ?, ?)`,
        [
          wr_subject,
          wr_content || '',
          wr_link1,
          `legacy-portfolio-${wr_id}`,
          wr_datetime || new Date().toISOString().slice(0, 19).replace('T', ' '),
          wr_datetime || new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]
      );
      
      imported++;
      if (imported % 10 === 0) {
        console.log(`Imported ${imported} records...`);
      }
    } catch (error) {
      console.error(`Error importing record:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✓ Imported ${imported} Making Film records`);
  console.log(`✗ Skipped ${skipped} records`);
};

// Convert g5_write_notice to posts
const importNoticeData = async () => {
  console.log('\n=== Importing Notice Data ===');
  const valuesData = extractInsertData('g5_write_notice');
  if (!valuesData) return;
  
  const records = parseValues(valuesData);
  console.log(`Found ${records.length} records in g5_write_notice`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const record of records) {
    try {
      const fields = [];
      let current = '';
      let inString = false;
      let escapeNext = false;
      
      for (let i = 0; i < record.length; i++) {
        const char = record[i];
        
        if (escapeNext) {
          current += char;
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          current += char;
          continue;
        }
        
        if (char === "'") {
          inString = !inString;
          current += char;
          continue;
        }
        
        if (char === ',' && !inString) {
          fields.push(current.trim());
          current = '';
          continue;
        }
        
        current += char;
      }
      fields.push(current.trim());
      
      const wr_id = fields[0];
      const wr_subject = fields[10]?.replace(/^'|'$/g, '').replace(/\\'/g, "'");
      const wr_content = fields[11]?.replace(/^'|'$/g, '').replace(/\\'/g, "'");
      const wr_datetime = fields[25]?.replace(/^'|'$/g, '');
      
      if (!wr_subject) {
        skipped++;
        continue;
      }
      
      await connection.execute(
        `INSERT INTO posts (title, content, category, authorId, status, createdAt, updatedAt)
         VALUES (?, ?, 'notice', 1, 'published', ?, ?)`,
        [
          wr_subject,
          wr_content || '',
          wr_datetime || new Date().toISOString().slice(0, 19).replace('T', ' '),
          wr_datetime || new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing record:`, error.message);
      skipped++;
    }
  }
  
  console.log(`✓ Imported ${imported} Notice records`);
  console.log(`✗ Skipped ${skipped} records`);
};

// Main execution
try {
  await importLiveData();
  await importPortfolioData();
  await importNoticeData();
  
  console.log('\n=== Import Complete ===');
} catch (error) {
  console.error('Fatal error:', error);
} finally {
  await connection.end();
}
