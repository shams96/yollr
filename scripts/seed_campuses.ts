import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CollegeData {
  name: string;
  city: string;
  state: string;
  zip: string;
  enrollment: string;
  is_athletics_power5: boolean;
  domain: string;
  lat: number;
  lng: number;
}

async function geocodeZip(zip: string): Promise<{ lat: number; lng: number }> {
  // In production, use a real geocoding service like Mapbox or Google Maps
  // For now, we'll use a simple mock geocoding based on ZIP patterns
  const zipPrefix = zip.substring(0, 3);
  const mockCoords: Record<string, { lat: number; lng: number }> = {
    '021': { lat: 42.3601, lng: -71.0589 }, // Boston area
    '943': { lat: 37.4275, lng: -122.1697 }, // Stanford/Palo Alto
    '900': { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    '100': { lat: 40.7128, lng: -74.0060 }, // New York
    '606': { lat: 41.8781, lng: -87.6298 }, // Chicago
    '191': { lat: 39.9526, lng: -75.1652 }, // Philadelphia
    '303': { lat: 33.7490, lng: -84.3880 }, // Atlanta
    '787': { lat: 30.2672, lng: -97.7431 }, // Austin
    '200': { lat: 38.9072, lng: -77.0369 }, // Washington DC
    '277': { lat: 35.9940, lng: -78.8986 }, // Durham (Duke)
    '152': { lat: 40.4406, lng: -79.9959 }, // Pittsburgh
    '481': { lat: 42.2808, lng: -83.7430 }, // Ann Arbor
    '537': { lat: 43.0731, lng: -89.4012 }, // Madison
    '432': { lat: 39.9612, lng: -82.9988 }, // Columbus
    '326': { lat: 29.6516, lng: -82.3248 }, // Gainesville
    '474': { lat: 39.1653, lng: -86.5264 }, // Bloomington
    '618': { lat: 40.1106, lng: -88.2284 }, // Champaign
    '379': { lat: 35.9606, lng: -83.9207 }, // Knoxville
    '386': { lat: 34.3668, lng: -89.5186 }, // Oxford (Ole Miss)
    '708': { lat: 30.4133, lng: -91.1800 }, // Baton Rouge
    '354': { lat: 33.2098, lng: -87.5692 }, // Tuscaloosa
    '368': { lat: 32.6099, lng: -85.4808 }, // Auburn
    '778': { lat: 30.6280, lng: -96.3344 }, // College Station
    ' Norman': { lat: 35.2226, lng: -97.4395 }, // Norman (Oklahoma)
    '402': { lat: 38.0406, lng: -84.5037 }, // Lexington
    '405': { lat: 38.0498, lng: -84.4977 }, // Lexington (UK)
    '479': { lat: 36.0689, lng: -94.2091 }, // Fayetteville
    '727': { lat: 36.0689, lng: -94.2091 }, // Fayetteville
    '720': { lat: 34.7465, lng: -92.2896 }, // Little Rock
    '844': { lat: 41.7370, lng: -111.8338 }, // Logan (Utah State)
    '846': { lat: 40.2518, lng: -111.6493 }, // Provo (BYU)
    '841': { lat: 40.7608, lng: -111.8910 }, // Salt Lake City (Utah)
  };

  return mockCoords[zipPrefix] || { lat: 39.8283, lng: -98.5795 }; // Default to US center
}

function parseEnrollment(enrollmentStr: string): number {
  const cleaned = enrollmentStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function isPower5Conference(collegeName: string): boolean {
  const power5Keywords = [
    'SEC', 'ACC', 'Big Ten', 'Big 12', 'Pac-12',
    'Alabama', 'Auburn', 'Georgia', 'Florida', 'LSU', 'Tennessee', 'Texas A&M', 'Ole Miss', 'Mississippi State', 'Arkansas', 'Missouri', 'South Carolina', 'Kentucky', 'Vanderbilt',
    'Clemson', 'Florida State', 'Miami', 'North Carolina', 'NC State', 'Virginia', 'Virginia Tech', 'Georgia Tech', 'Louisville', 'Pittsburgh', 'Syracuse', 'Boston College', 'Wake Forest', 'Duke',
    'Ohio State', 'Michigan', 'Penn State', 'Wisconsin', 'Iowa', 'Minnesota', 'Nebraska', 'Purdue', 'Illinois', 'Indiana', 'Maryland', 'Rutgers', 'Michigan State', 'Northwestern',
    'Oklahoma', 'Texas', 'Kansas', 'Kansas State', 'Iowa State', 'West Virginia', 'TCU', 'Baylor', 'Oklahoma State',
    'USC', 'UCLA', 'Oregon', 'Washington', 'Stanford', 'California', 'Arizona', 'Arizona State', 'Colorado', 'Utah'
  ];
  
  return power5Keywords.some(keyword => 
    collegeName.toUpperCase().includes(keyword.toUpperCase())
  );
}

async function seedCampuses() {
  console.log('Starting campus seeding...');

  // Read CSV file with college data
  const csvPath = path.join(__dirname, '../data/colleges.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('No colleges.csv found, creating sample data...');
    
    // Create sample data for major US colleges
    const sampleColleges: CollegeData[] = [
      {
        name: 'Stanford University',
        city: 'Stanford',
        state: 'CA',
        zip: '94305',
        enrollment: '17381',
        is_athletics_power5: true,
        domain: 'stanford.edu',
        lat: 37.4275,
        lng: -122.1697,
      },
      {
        name: 'Massachusetts Institute of Technology',
        city: 'Cambridge',
        state: 'MA',
        zip: '02139',
        enrollment: '11520',
        is_athletics_power5: false,
        domain: 'mit.edu',
        lat: 42.3601,
        lng: -71.0921,
      },
      {
        name: 'Harvard University',
        city: 'Cambridge',
        state: 'MA',
        zip: '02138',
        enrollment: '21574',
        is_athletics_power5: false,
        domain: 'harvard.edu',
        lat: 42.3770,
        lng: -71.1167,
      },
      {
        name: 'University of California, Berkeley',
        city: 'Berkeley',
        state: 'CA',
        zip: '94720',
        enrollment: '42479',
        is_athletics_power5: true,
        domain: 'berkeley.edu',
        lat: 37.8715,
        lng: -122.2730,
      },
      {
        name: 'University of Michigan',
        city: 'Ann Arbor',
        state: 'MI',
        zip: '48109',
        enrollment: '47893',
        is_athletics_power5: true,
        domain: 'umich.edu',
        lat: 42.2780,
        lng: -83.7382,
      },
      {
        name: 'University of Texas at Austin',
        city: 'Austin',
        state: 'TX',
        zip: '78712',
        enrollment: '51791',
        is_athletics_power5: true,
        domain: 'utexas.edu',
        lat: 30.2849,
        lng: -97.7341,
      },
      {
        name: 'University of Florida',
        city: 'Gainesville',
        state: 'FL',
        zip: '32611',
        enrollment: '52951',
        is_athletics_power5: true,
        domain: 'ufl.edu',
        lat: 29.6436,
        lng: -82.3549,
      },
      {
        name: 'University of Washington',
        city: 'Seattle',
        state: 'WA',
        zip: '98195',
        enrollment: '47571',
        is_athletics_power5: true,
        domain: 'uw.edu',
        lat: 47.6553,
        lng: -122.3035,
      },
      {
        name: 'Pennsylvania State University',
        city: 'University Park',
        state: 'PA',
        zip: '16802',
        enrollment: '46723',
        is_athletics_power5: true,
        domain: 'psu.edu',
        lat: 40.7982,
        lng: -77.8599,
      },
      {
        name: 'University of Illinois Urbana-Champaign',
        city: 'Urbana',
        state: 'IL',
        zip: '61801',
        enrollment: '52552',
        is_athletics_power5: true,
        domain: 'illinois.edu',
        lat: 40.1100,
        lng: -88.2272,
      },
    ];

    // Insert sample colleges
    for (const college of sampleColleges) {
      const { error } = await supabase.from('campuses').insert({
        name: college.name,
        zip_code: college.zip,
        lat: college.lat,
        lng: college.lng,
        domain: college.domain,
        enrollment: parseEnrollment(college.enrollment),
        is_athletics_power5: college.is_athletics_power5,
      });

      if (error) {
        console.error(`Error inserting ${college.name}:`, error.message);
      } else {
        console.log(`✅ Inserted ${college.name}`);
      }
    }

    console.log('Sample campus seeding completed!');
    return;
  }

  // Parse CSV file if it exists
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Found ${records.length} colleges in CSV`);

  // Process and insert colleges
  for (const record of records as any[]) {
    try {
      const collegeName = record['Name'] || record['INSTNM'] || record['name'];
      const zip = record['ZIP'] || record['zip'] || record['ZIPCODE'];
      const enrollment = record['Enrollment'] || record['enrollment'] || record['ENROLLMENT'];
      const domain = record['Domain'] || record['domain'] || record['WEBADDR'];
      
      if (!collegeName || !zip) {
        console.log(`Skipping record with missing name or zip:`, record);
        continue;
      }

      // Geocode the ZIP
      const { lat, lng } = await geocodeZip(zip);
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('campuses')
        .select('id')
        .eq('domain', domain)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping ${collegeName} - already exists`);
        continue;
      }

      // Insert campus
      const { error } = await supabase.from('campuses').insert({
        name: collegeName,
        zip_code: zip,
        lat,
        lng,
        domain: domain || `${collegeName.toLowerCase().replace(/\s+/g, '')}.edu`,
        enrollment: parseEnrollment(enrollment),
        is_athletics_power5: isPower5Conference(collegeName),
      });

      if (error) {
        console.error(`Error inserting ${collegeName}:`, error.message);
      } else {
        console.log(`✅ Inserted ${collegeName}`);
      }

      // Rate limiting to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`Error processing record:`, error);
    }
  }

  console.log('Campus seeding completed!');
}

// Run if called directly
if (require.main === module) {
  seedCampuses().catch(console.error);
}

export { seedCampuses };