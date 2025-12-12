// Test script for individual offer routes
const BASE_URL = 'http://localhost:3000'

async function testOfferRoutes() {
  console.log('🧪 Testing Individual Offer Routes...\n')

  try {
    // Test GET /api/offers/crop/[id]
    console.log('1. Testing GET /api/offers/crop/[id]...')
    const testCropId = 'test-crop-id'
    const response1 = await fetch(`${BASE_URL}/api/offers/crop/${testCropId}`)
    const result1 = await response1.json()
    console.log('Status:', response1.status)
    console.log('Response:', result1)
    console.log('✅ Should return empty array or offers for crop\n')

    // Test PUT /api/offers/[id] with invalid status
    console.log('2. Testing PUT /api/offers/[id] with invalid status...')
    const testOfferId = 'test-offer-id'
    const response2 = await fetch(`${BASE_URL}/api/offers/${testOfferId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'invalid_status'
      })
    })
    const result2 = await response2.json()
    console.log('Status:', response2.status)
    console.log('Response:', result2)
    console.log('✅ Expected 400 error for invalid status\n')

    // Test PUT /api/offers/[id] with valid status but non-existent offer
    console.log('3. Testing PUT /api/offers/[id] with valid status...')
    const response3 = await fetch(`${BASE_URL}/api/offers/${testOfferId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'accepted'
      })
    })
    const result3 = await response3.json()
    console.log('Status:', response3.status)
    console.log('Response:', result3)
    console.log('✅ Expected 404 or database error for non-existent offer\n')

    console.log('🎉 Individual offer route tests completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testOfferRoutes()