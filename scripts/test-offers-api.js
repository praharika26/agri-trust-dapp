// Test script for offers API
const BASE_URL = 'http://localhost:3000'

async function testOffersAPI() {
  console.log('🧪 Testing Offers API...\n')

  try {
    // Test GET /api/offers with missing wallet_address
    console.log('1. Testing GET /api/offers without wallet_address...')
    const response1 = await fetch(`${BASE_URL}/api/offers`)
    const result1 = await response1.json()
    console.log('Status:', response1.status)
    console.log('Response:', result1)
    console.log('✅ Expected 400 error for missing wallet_address\n')

    // Test GET /api/offers with wallet_address
    console.log('2. Testing GET /api/offers with wallet_address...')
    const testWallet = '0x1234567890123456789012345678901234567890'
    const response2 = await fetch(`${BASE_URL}/api/offers?wallet_address=${testWallet}&type=received`)
    const result2 = await response2.json()
    console.log('Status:', response2.status)
    console.log('Response:', result2)
    console.log('✅ Should return empty array or offers\n')

    // Test POST /api/offers with invalid data
    console.log('3. Testing POST /api/offers with invalid data...')
    const response3 = await fetch(`${BASE_URL}/api/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: testWallet,
        offer_data: {
          // Missing required fields
        }
      })
    })
    const result3 = await response3.json()
    console.log('Status:', response3.status)
    console.log('Response:', result3)
    console.log('✅ Expected 400 error for missing required fields\n')

    console.log('🎉 Offers API tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testOffersAPI()