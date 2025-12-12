// Comprehensive test script for all API endpoints
const BASE_URL = 'http://localhost:3000'

async function testAllAPIs() {
  console.log('🧪 Testing All API Endpoints...\n')

  const testWallet = '0x1234567890123456789012345678901234567890'

  try {
    // Test Users API
    console.log('=== USERS API ===')
    
    console.log('1. Testing GET /api/users without wallet_address...')
    let response = await fetch(`${BASE_URL}/api/users`)
    let result = await response.json()
    console.log('Status:', response.status, 'Expected: 400')
    console.log('Response:', result)
    console.log()

    console.log('2. Testing GET /api/users with wallet_address...')
    response = await fetch(`${BASE_URL}/api/users?wallet_address=${testWallet}`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response:', result)
    console.log()

    console.log('3. Testing POST /api/users...')
    response = await fetch(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet_address: testWallet,
        email: 'test@example.com',
        role: 'farmer'
      })
    })
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response:', result)
    console.log()

    // Test Crops API
    console.log('=== CROPS API ===')
    
    console.log('4. Testing GET /api/crops...')
    response = await fetch(`${BASE_URL}/api/crops`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response keys:', Object.keys(result))
    console.log()

    console.log('5. Testing GET /api/crops/farmer/[wallet]...')
    response = await fetch(`${BASE_URL}/api/crops/farmer/${testWallet}`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response:', Array.isArray(result) ? `Array with ${result.length} items` : result)
    console.log()

    // Test Offers API
    console.log('=== OFFERS API ===')
    
    console.log('6. Testing GET /api/offers...')
    response = await fetch(`${BASE_URL}/api/offers?wallet_address=${testWallet}&type=received`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response:', Array.isArray(result) ? `Array with ${result.length} items` : result)
    console.log()

    // Test Auctions API
    console.log('=== AUCTIONS API ===')
    
    console.log('7. Testing GET /api/auctions...')
    response = await fetch(`${BASE_URL}/api/auctions`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response keys:', Object.keys(result))
    console.log()

    // Test Bids API
    console.log('=== BIDS API ===')
    
    console.log('8. Testing GET /api/bids...')
    response = await fetch(`${BASE_URL}/api/bids?wallet_address=${testWallet}`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response:', Array.isArray(result) ? `Array with ${result.length} items` : result)
    console.log()

    // Test Orders API
    console.log('=== ORDERS API ===')
    
    console.log('9. Testing GET /api/orders...')
    response = await fetch(`${BASE_URL}/api/orders?wallet_address=${testWallet}&type=buyer`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response:', Array.isArray(result) ? `Array with ${result.length} items` : result)
    console.log()

    // Test Stats API
    console.log('=== STATS API ===')
    
    console.log('10. Testing GET /api/stats for farmer...')
    response = await fetch(`${BASE_URL}/api/stats?wallet_address=${testWallet}&type=farmer`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response keys:', Object.keys(result))
    console.log()

    console.log('11. Testing GET /api/stats for buyer...')
    response = await fetch(`${BASE_URL}/api/stats?wallet_address=${testWallet}&type=buyer`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 200')
    console.log('Response keys:', Object.keys(result))
    console.log()

    // Test Error Handling
    console.log('=== ERROR HANDLING ===')
    
    console.log('12. Testing invalid crop ID...')
    response = await fetch(`${BASE_URL}/api/crops/invalid-id`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 500 or 404')
    console.log('Response:', result)
    console.log()

    console.log('13. Testing invalid auction ID...')
    response = await fetch(`${BASE_URL}/api/auctions/invalid-id`)
    result = await response.json()
    console.log('Status:', response.status, 'Expected: 500 or 404')
    console.log('Response:', result)
    console.log()

    console.log('🎉 All API tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAllAPIs()