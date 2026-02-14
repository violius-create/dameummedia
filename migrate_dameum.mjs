/**
 * dameum.kr DB 백업 → 현재 프로젝트 DB 마이그레이션 스크립트
 * 
 * 대상 테이블:
 * - g5_write_reservation → reservations (326건)
 * - g5_write_portfoliodata → posts (portfolio, 206건)
 * - g5_write_live → posts (concert, 187건)
 * - g5_write_notice → posts (notice, 6건)
 * - g5_write_photo → posts (film, 13건)
 * - g5_write_business → informationItems (14건)
 * - g5_write_company → informationItems (4건)
 * - g5_write_greeting → informationItems (9건)
 * - g5_write_WLMSS → posts (3건)
 * - g5_write_WMPCMSS → posts (15건)
 */

import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '/home/ubuntu/dameum-media-analysis/.env' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

// Parse SQL file
const sqlContent = fs.readFileSync('/home/ubuntu/upload/20260206_dameum1_DB_Backup.sql', 'utf-8');

/**
 * Parse INSERT VALUES from a gnuboard table
 * Returns array of arrays (each inner array = one record's field values)
 */
function parseInsertValues(tableName) {
  const pattern = `INSERT INTO \`${tableName}\` VALUES `;
  const records = [];
  
  for (const line of sqlContent.split('\n')) {
    if (line.includes(pattern)) {
      const valsPart = line.substring(line.indexOf(pattern) + pattern.length);
      
      // Parse records by tracking parentheses depth
      let depth = 0;
      let start = 0;
      let inString = false;
      let escapeNext = false;
      let quoteChar = null;
      
      for (let i = 0; i < valsPart.length; i++) {
        const ch = valsPart[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (ch === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (inString) {
          if (ch === quoteChar) {
            // Check for escaped quote ('')
            if (i + 1 < valsPart.length && valsPart[i + 1] === quoteChar) {
              i++; // Skip escaped quote
              continue;
            }
            inString = false;
          }
          continue;
        }
        
        if (ch === "'" || ch === '"') {
          inString = true;
          quoteChar = ch;
          continue;
        }
        
        if (ch === '(') {
          if (depth === 0) start = i + 1;
          depth++;
        } else if (ch === ')') {
          depth--;
          if (depth === 0) {
            records.push(valsPart.substring(start, i));
          }
        }
      }
    }
  }
  
  return records;
}

/**
 * Parse a single record string into field values
 */
function parseRecord(recordStr) {
  const fields = [];
  let current = '';
  let inString = false;
  let escapeNext = false;
  let quoteChar = null;
  
  for (let i = 0; i < recordStr.length; i++) {
    const ch = recordStr[i];
    
    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }
    
    if (ch === '\\') {
      escapeNext = true;
      current += ch;
      continue;
    }
    
    if (inString) {
      if (ch === quoteChar) {
        if (i + 1 < recordStr.length && recordStr[i + 1] === quoteChar) {
          current += ch;
          i++;
          continue;
        }
        inString = false;
        // Don't add the closing quote
        continue;
      }
      current += ch;
      continue;
    }
    
    if (ch === "'" || ch === '"') {
      inString = true;
      quoteChar = ch;
      continue;
    }
    
    if (ch === ',') {
      fields.push(current.trim());
      current = '';
      continue;
    }
    
    current += ch;
  }
  
  fields.push(current.trim());
  return fields;
}

/**
 * Clean HTML content - strip tags for plain text, keep for rich content
 */
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/**
 * Parse date string from various Korean date formats
 */
function parseDateString(dateStr) {
  if (!dateStr || dateStr === 'NULL' || dateStr === '0000-00-00 00:00:00') return null;
  
  // Try standard datetime format first
  const stdMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (stdMatch) {
    const year = parseInt(stdMatch[1]);
    if (year < 2000 || year > 2100) return null;
    return new Date(`${stdMatch[1]}-${stdMatch[2]}-${stdMatch[3]}T${stdMatch[4]}:${stdMatch[5]}:${stdMatch[6]}`);
  }
  
  // Korean date formats: "2014년 4월 26일 7시", "2014.09.01. 오후 7시", etc.
  const korMatch = dateStr.match(/(\d{4})[년.]?\s*(\d{1,2})[월.]?\s*(\d{1,2})/);
  if (korMatch) {
    const y = korMatch[1];
    const m = korMatch[2].padStart(2, '0');
    const d = korMatch[3].padStart(2, '0');
    return new Date(`${y}-${m}-${d}T00:00:00`);
  }
  
  return null;
}

/**
 * Map status from Korean to enum
 */
function mapStatus(koreanStatus) {
  const statusMap = {
    '작업완료': 'completed',
    '완료': 'completed',
    '작업중': 'in_progress',
    '편집중': 'editing',
    '확인': 'confirmed',
    '결제완료': 'payment_completed',
    '취소': 'cancelled',
    '대기': 'pending',
    '예약취소': 'cancelled',
    '예약확인': 'confirmed',
  };
  return statusMap[koreanStatus] || 'pending';
}

/**
 * Parse amount string (remove commas, handle Korean won)
 */
function parseAmount(amountStr) {
  if (!amountStr || amountStr === 'NULL' || amountStr === '') return 0;
  const cleaned = amountStr.replace(/[,원\s]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Map payment method
 */
function mapPaymentMethod(payStr) {
  if (!payStr || payStr === 'NULL' || payStr === '') return null;
  if (payStr.includes('100%') || payStr.includes('전액')) return 'full';
  if (payStr.includes('50%') || payStr.includes('반액')) return 'half';
  if (payStr.includes('카드')) return 'card';
  if (payStr.includes('이체') || payStr.includes('송금')) return 'transfer';
  if (payStr.includes('현금')) return 'cash';
  return 'other';
}

async function main() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Clean up previous migration data
    console.log('\n=== Cleaning up previous migration data ===');
    await connection.execute('DELETE FROM reservations WHERE 1=1');
    await connection.execute('DELETE FROM posts WHERE 1=1');
    console.log('  Cleaned up reservations and posts');
    
    // =============================================
    // 1. Migrate Reservations (g5_write_reservation → reservations)
    // =============================================
    console.log('\n=== Migrating Reservations ===');
    const reservationRecords = parseInsertValues('g5_write_reservation');
    console.log(`Found ${reservationRecords.length} reservation records`);
    
    let resInserted = 0;
    for (const recStr of reservationRecords) {
      const f = parseRecord(recStr);
      // Skip comments (wr_is_comment = 1)
      if (f[4] === '1') continue;
      
      const wrId = parseInt(f[0]);
      const subject = cleanHtml(f[9]); // wr_subject = eventName
      const content = cleanHtml(f[10]); // wr_content = description
      const name = cleanHtml(f[21]); // wr_name = clientName
      const email = cleanHtml(f[22]); // wr_email = clientEmail
      const datetime = f[24]; // wr_datetime
      const venue = cleanHtml(f[30]); // wr_1 = venue
      const eventDateStr = cleanHtml(f[31]); // wr_2 = event date
      const rehearsalTime = cleanHtml(f[32]); // wr_3 = rehearsal time
      const composition = cleanHtml(f[33]); // wr_4 = composition
      let phone = cleanHtml(f[34]); // wr_5 = phone
      // Truncate phone to 20 chars
      if (phone && phone.length > 20) phone = phone.substring(0, 20);
      const packageType = cleanHtml(f[35]); // wr_6 = package
      const permission = cleanHtml(f[36]); // wr_7 = permission (허용/불허)
      const statusKr = cleanHtml(f[37]); // wr_8 = status
      const paymentStr = f[38] ? cleanHtml(f[38]) : ''; // wr_9 = payment
      const amountStr = f[39] ? cleanHtml(f[39]) : ''; // wr_10 = amount
      const serviceType = f[44] ? cleanHtml(f[44]) : ''; // wr_15 = service type
      
      let eventDate = parseDateString(eventDateStr) || parseDateString(datetime);
      // Validate eventDate is within reasonable range
      if (eventDate && (eventDate.getFullYear() < 2000 || eventDate.getFullYear() > 2100)) eventDate = null;
      const createdAt = parseDateString(datetime) || new Date();
      const status = mapStatus(statusKr);
      const isPublic = permission === '허용' ? 1 : 0;
      const quotedAmount = parseAmount(amountStr);
      const paymentMethod = mapPaymentMethod(paymentStr);
      
      // Build specialRequirements from package + service type
      const specialReqs = [packageType, serviceType].filter(Boolean).join(' / ');
      
      try {
        await connection.execute(
          `INSERT INTO reservations (clientName, clientEmail, clientPhone, eventName, eventType, venue, eventDate, rehearsalTime, composition, specialRequirements, paymentMethod, isPublic, quotedAmount, description, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 'concert', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name || 'Unknown',
            email || 'unknown@example.com',
            phone || null,
            subject || 'Untitled',
            venue || null,
            eventDate,
            rehearsalTime || null,
            composition || null,
            specialReqs || null,
            paymentMethod,
            isPublic,
            quotedAmount,
            content || null,
            status,
            createdAt,
            createdAt,
          ]
        );
        resInserted++;
      } catch (err) {
        console.error(`  Error inserting reservation ${wrId}: ${err.message}`);
      }
    }
    console.log(`  Inserted ${resInserted} reservations`);
    
    // =============================================
    // 2. Migrate Posts (various boards → posts)
    // =============================================
    
    // Helper to migrate a gnuboard write table to posts
    async function migratePosts(gnuTable, category, label) {
      console.log(`\n=== Migrating ${label} (${gnuTable} → posts/${category}) ===`);
      const records = parseInsertValues(gnuTable);
      console.log(`  Found ${records.length} records`);
      
      let inserted = 0;
      for (const recStr of records) {
        const f = parseRecord(recStr);
        // Skip comments
        if (f[4] === '1') continue;
        
        const wrId = parseInt(f[0]);
        const subject = cleanHtml(f[9]);
        const content = cleanHtml(f[10]);
        const datetime = f[24];
        const viewCount = parseInt(f[16]) || 0;
        const link1 = cleanHtml(f[12]);
        
        const createdAt = parseDateString(datetime) || new Date();
        
        // Skip empty/system records
        if (!subject || subject.includes('여분필드') || subject.includes('pp_sheet')) continue;
        
        try {
          await connection.execute(
            `INSERT INTO posts (title, content, category, authorId, videoUrl, viewCount, status, createdAt, updatedAt)
             VALUES (?, ?, ?, 1, ?, ?, 'published', ?, ?)`,
            [
              subject || 'Untitled',
              content || '',
              category,
              link1 || null,
              viewCount,
              createdAt,
              createdAt,
            ]
          );
          inserted++;
        } catch (err) {
          console.error(`  Error inserting post ${wrId} from ${gnuTable}: ${err.message}`);
        }
      }
      console.log(`  Inserted ${inserted} posts as ${category}`);
      return inserted;
    }
    
    // Migrate each board
    await migratePosts('g5_write_notice', 'notice', '공지사항');
    await migratePosts('g5_write_portfoliodata', 'portfolio', '포트폴리오');
    await migratePosts('g5_write_live', 'concert', '공연 실황');
    await migratePosts('g5_write_photo', 'film', '사진/영상');
    
    // =============================================
    // 3. Migrate Information Items
    // =============================================
    async function migrateInfoItems(gnuTable, sectionKey, label) {
      console.log(`\n=== Migrating ${label} (${gnuTable} → informationItems/${sectionKey}) ===`);
      const records = parseInsertValues(gnuTable);
      console.log(`  Found ${records.length} records`);
      
      // Check if section already has data
      const [existing] = await connection.execute(
        'SELECT COUNT(*) as cnt FROM informationItems WHERE sectionKey = ?', [sectionKey]
      );
      if (existing[0].cnt > 0) {
        console.log(`  Section ${sectionKey} already has ${existing[0].cnt} items, skipping`);
        return 0;
      }
      
      let inserted = 0;
      for (const recStr of records) {
        const f = parseRecord(recStr);
        if (f[4] === '1') continue;
        
        const subject = cleanHtml(f[9]);
        const content = cleanHtml(f[10]);
        const datetime = f[24];
        const createdAt = parseDateString(datetime) || new Date();
        
        if (!subject) continue;
        
        // informationItems schema: id, sectionKey, title, items (JSON array), description, updatedBy, createdAt, updatedAt
        const items = JSON.stringify([subject]);
        
        try {
          await connection.execute(
            `INSERT INTO informationItems (sectionKey, title, items, description, updatedBy, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, 1, ?, ?)`,
            [
              sectionKey,
              subject,
              items,
              content || '',
              createdAt,
              createdAt,
            ]
          );
          inserted++;
        } catch (err) {
          console.error(`  Error inserting info item from ${gnuTable}: ${err.message}`);
        }
      }
      console.log(`  Inserted ${inserted} information items as ${sectionKey}`);
      return inserted;
    }
    
    await migrateInfoItems('g5_write_business', 'achievements', '사업 실적');
    await migrateInfoItems('g5_write_company', 'about', '회사 소개');
    await migrateInfoItems('g5_write_greeting', 'experiences', '인사말/경력');
    
    // =============================================
    // 4. Migrate WLMSS / WMPCMSS as review posts
    // =============================================
    await migratePosts('g5_write_WLMSS', 'review', 'WLMSS');
    await migratePosts('g5_write_WMPCMSS', 'review', 'WMPCMSS');
    
    // =============================================
    // 5. Summary
    // =============================================
    console.log('\n=== Migration Summary ===');
    const [resCount] = await connection.execute('SELECT COUNT(*) as cnt FROM reservations');
    const [postCount] = await connection.execute('SELECT COUNT(*) as cnt FROM posts');
    const [infoCount] = await connection.execute('SELECT COUNT(*) as cnt FROM informationItems');
    console.log(`  Reservations: ${resCount[0].cnt}`);
    console.log(`  Posts: ${postCount[0].cnt}`);
    console.log(`  Information Items: ${infoCount[0].cnt}`);
    
    console.log('\nMigration completed successfully!');
    
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

main();
