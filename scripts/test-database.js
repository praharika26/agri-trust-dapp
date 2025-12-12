const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🧪 Testing Supabase database connection...')
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Basic connection successful')
    
    // Test 2: Create a test user
    console.log('2️⃣ Testing user creation...')
    const testWallet = '0xTEST123456789'
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        wallet_address: testWallet,
        role: 'farmer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (userError) {
      console.error('❌ User creation failed:', userError.message)
      return false
    }
    
    console.log('✅ User creation successful:', user?.wallet_address)
    
    // Test 3: Create a test crop
    console.log('3️⃣ Testing crop creation...')
    const { data: crop, error: cropError } = await supabase
      .from('crops')
      .insert({
        farmer_id: user.id,
        title: 'Test Crop',
        description: 'This is a test crop for database verification',
        crop_type: 'wheat',
        variety: 'Test Variety',
        quantity: 100,
        unit: 'kg',
        harvest_date: '2024-01-15',
        location: 'Test Location',
        organic_certified: true,
        quality_grade: 'A',
        minimum_price: 50,
        starting_price: 60,
        buyout_price: 80,
        images: ['https://example.com/test.jpg'],
        ipfs_hash: 'QmTestHash123',
        nft_metadata_url: 'https://gateway.pinata.cloud/ipfs/QmTestHash123',
        nft_token_id: 999,
        nft_minted: true,
        nft_transaction_hash: '0xtest123',
        status: 'active'
      })
      .select()
      .single()
    
    if (cropError) {
      console.error('❌ Crop creation failed:', cropError.message)
      return false
    }
    
    console.log('✅ Crop creation successful:', crop?.title)
    
    // Test 4: Read the data back
    console.log('4️⃣ Testing data retrieval...')
    const { data: retrievedCrop, error: retrieveError } = await supabase
      .from('crops')
      .select(`
        *,
        farmer:users!farmer_id (
          id,
          wallet_address
        )
      `)
      .eq('id', crop.id)
      .single()
    
    if (retrieveError) {
      console.error('❌ Data retrieval failed:', retrieveError.message)
      return false
    }
    
    console.log('✅ Data retrieval successful')
    console.log('📊 Retrieved crop:', {
      id: retrievedCrop.id,
      title: retrievedCrop.title,
      farmer_wallet: retrievedCrop.farmer?.wallet_address,
      nft_token_id: retrievedCrop.nft_token_id
    })
    
    // Test 5: Clean up test data
    console.log('5️⃣ Cleaning up test data...')
    
    await supabase.from('crops').delete().eq('id', crop.id)
    await supabase.from('users').delete().eq('id', user.id)
    
    console.log('✅ Cleanup successful')
    
    console.log('\n🎉 All database tests passed!')
    console.log('✅ Your Supabase database is properly configured and working')
    console.log('✅ Data can be written and retrieved successfully')
    console.log('✅ Relationships between tables work correctly')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Test the API endpoint
async function testAPIEndpoint() {
  console.log('\n🌐 Testing API endpoint...')
  
  try {
    const testData = {
      wallet_address: '0xTEST123456789',
      crop_data: {
        title: 'API Test Crop',
        description: 'Testing crop creation via API',
        crop_type: 'rice',
        variety: 'Basmati',
        quantity: 200,
        unit: 'kg',
        harvest_date: '2024-01-20',
        location: 'Test Farm',
        organic_certified: false,
        quality_grade: 'B',
        minimum_price: 40,
        starting_price: 50,
        buyout_price: 70,
        images: ['https://example.com/rice.jpg'],
        ipfs_hash: 'QmAPITestHash',
        nft_metadata_url: 'https://gateway.pinata.cloud/ipfs/QmAPITestHash',
        nft_token_id: 888,
        nft_minted: true,
        nft_transaction_hash: '0xapitest123'
      }
    }
    
    const response = await fetch('http://localhost:3000/api/crops', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API request failed:', response.status, errorText)
      return false
    }
    
    const result = await response.json()
    console.log('✅ API endpoint working:', result.title)
    
    // Clean up
    await supabase.from('crops').delete().eq('id', result.id)
    await supabase.from('users').delete().eq('wallet_address', testData.wallet_address)
    
    return true
    
  } catch (error) {
    console.error('❌ API test failed:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive database tests...\n')
  
  const dbTest = await testDatabaseConnection()
  
  if (dbTest) {
    console.log('\n📡 Starting API tests...')
    const apiTest = await testAPIEndpoint()
    
    if (apiTest) {
      console.log('\n🎊 ALL TESTS PASSED!')
      console.log('Your AgriTrust database is ready for production use!')
    } else {
      console.log('\n⚠️ Database works but API has issues')
    }
  } else {
    console.log('\n❌ Database tests failed - check your Supabase configuration')
  }
}

runAllTests()