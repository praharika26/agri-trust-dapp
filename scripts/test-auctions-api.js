// Test script for auctions API
const BASE_URL = 'http://localhost:3000'

async function testAuctionsAPI() {
  console.log('🧪 Testing Auctions API...\n')

  try {
    // Test GET /api/auctions
    console.log('1. Testing GET /api/auctions...')
    const response1 = await fetch(`${BASE_URL}/api/auctions`)
    const result1 = await response1.json()
    console.log('Status:', response1.status)
    console.log('Response:', result1)
    console.log('✅ Should return paginated auctions\n')

    // Test GET /api/auctions with filters
    console.log('2. Testing GET /api/auctions with status filter...')
    const response2 = await fetch(`${BASE_URL}/api/auctions?status=active&page=1&limit=5`)
    const result2 = await response2.json()
    console.log('Status:', response2.status)
    console.log('Response:', result2)
    console.log('✅ Should return filtered auctions\n')

    // Test POST /api/auctions with invalid data
    console.log('3. Testing POST /api/auctions with invalid data...')
    const response3 = await fetch(`${BASE_URL}/api/auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: '0x1234567890123456789012345678901234567890',
        auction_data: {
          // Missing required fields
        }
      })
    })
    const result3 = await response3.json()
    console.log('Status:', response3.status)
    console.log('Response:', result3)
    console.log('✅ Expected 400 error for missing required fields\n')

    // Test GET /api/auctions/[id] with non-existent ID
    console.log('4. Testing GET /api/auctions/[id] with non-existent ID...')
    const testAuctionId = 'non-existent-id'
    const response4 = await fetch(`${BASE_URL}/api/auctions/${testAuctionId}`)
    const result4 = await response4.json()
    console.log('Status:', response4.status)
    console.log('Response:', result4)
    console.log('✅ Expected 404 or database error\n')

    // Test GET /api/bids
    console.log('5. Testing GET /api/bids without wallet_address...')
    const response5 = await fetch(`${BASE_URL}/api/bids`)
    const result5 = await response5.json()
    console.log('Status:', response5.status)
    console.log('Response:', result5)
    console.log('✅ Expected 400 error for missing wallet_address\n')

    // Test GET /api/bids with wallet_address
    console.log('6. Testing GET /api/bids with wallet_address...')
    const testWallet = '0x1234567890123456789012345678901234567890'
    const response6 = await fetch(`${BASE_URL}/api/bids?wallet_address=${testWallet}`)
    const result6 = await response6.json()
    console.log('Status:', response6.status)
    console.log('Response:', result6)
    console.log('✅ Should return empty array or user bids\n')

    console.log('🎉 Auctions API tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAuctionsAPI()