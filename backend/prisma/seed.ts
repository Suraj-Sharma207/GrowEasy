import { PrismaClient, CRMStatus, DataSource } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = ['Aarav', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Neha', 'Arjun', 'Kavya', 'Siddharth', 'Divya', 'Rohan', 'Isha', 'Aditya', 'Meera', 'Karan'];
const lastNames = ['Patel', 'Sharma', 'Verma', 'Gupta', 'Singh', 'Reddy', 'Mehta', 'Nair', 'Joshi', 'Kapoor', 'Kumar', 'Das', 'Sen', 'Bose', 'Rao'];
const companies = ['TechCorp', 'Innovate IO', 'GrowthStack', 'CloudNine', 'DataFlow', 'NexGen', 'ScaleHub', 'BrightSpark', 'QuantumLeap', 'FinEdge'];
const cities = ['Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida', 'Ahmedabad', 'Kolkata'];
const states = ['Maharashtra', 'Karnataka', 'Delhi', 'Telangana', 'Maharashtra', 'Tamil Nadu', 'Haryana', 'UP', 'Gujarat', 'West Bengal'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomStatus(): CRMStatus {
  const statuses = Object.values(CRMStatus);
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomSource(): DataSource {
  const sources = Object.values(DataSource);
  return sources[Math.floor(Math.random() * sources.length)];
}

async function main() {
  console.log('Seeding database...');
  
  // Create 50 leads
  for (let i = 0; i < 50; i++) {
    const fName = getRandomItem(firstNames);
    const lName = getRandomItem(lastNames);
    const company = getRandomItem(companies);
    
    // Spread out createdAt dates so we can test sorting properly
    // Dates from last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.lead.create({
      data: {
        name: `${fName} ${lName}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@${company.toLowerCase().replace(' ', '')}.com`,
        countryCode: '+91',
        mobileWithoutCountryCode: `${Math.floor(9000000000 + Math.random() * 999999999)}`,
        company: company,
        city: getRandomItem(cities),
        state: getRandomItem(states),
        country: 'India',
        leadOwner: 'Admin User',
        crmStatus: getRandomStatus(),
        dataSource: getRandomSource(),
        createdAt: createdAt,
        updatedAt: createdAt,
      }
    });
  }

  // Also create a few brand new leads that will appear at the top
  const newLead1 = await prisma.lead.create({
    data: {
      name: 'Riya Malhotra',
      email: 'riya.malhotra@zenithcorp.in',
      countryCode: '+91',
      mobileWithoutCountryCode: '9876543210',
      company: 'Zenith Corp',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      leadOwner: 'Admin User',
      crmStatus: CRMStatus.NEW || CRMStatus.GOOD_LEAD_FOLLOW_UP, // Handling enum gracefully if NEW isn't in schema
      dataSource: DataSource.leads_on_demand,
      createdAt: new Date(), // Just now
      updatedAt: new Date(),
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
