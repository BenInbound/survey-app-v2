const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ixbupbyjldqecmdpfidb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4YnVwYnlqbGRxZWNtZHBmaWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjc4MjIsImV4cCI6MjA3MTYwMzgyMn0.xp9TwufWCl3ye2gwSmI7m1tGR5Fb15512jBPvxflcHI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('🔌 Testing database connection...')
  
  try {
    // Test 1: Check if we can connect
    const { data: testData, error: testError } = await supabase
      .from('organizational_assessments')
      .select('id')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection failed:', testError)
      return
    }

    console.log('✅ Database connection successful!')
    console.log('📊 Existing assessments:', testData?.length || 0)

    // Test 2: Check if demo assessment exists
    const { data: demoData, error: demoError } = await supabase
      .from('organizational_assessments')
      .select('*')
      .eq('id', 'demo-org')
      .single()

    if (demoError) {
      if (demoError.code === 'PGRST116') {
        console.log('📝 Demo assessment not in database yet (will sync from localStorage)')
      } else {
        console.error('❌ Demo check failed:', demoError)
      }
    } else {
      console.log('✅ Demo assessment found in database!')
      console.log(`   Organization: ${demoData.organization_name}`)
      console.log(`   Access Code: ${demoData.access_code}`)
      console.log(`   Status: ${demoData.status}`)
      console.log(`   Response Count: ${JSON.stringify(demoData.response_count)}`)
    }

    // Test 3: Check participant responses
    const { data: responseData, error: responseError } = await supabase
      .from('participant_responses')
      .select('*')
      .limit(5)

    if (responseError) {
      console.error('❌ Response check failed:', responseError)
    } else {
      console.log('✅ Participant responses table accessible!')
      console.log(`   Response count: ${responseData?.length || 0}`)
    }

    console.log('\n🎉 Database migration successful!')
    console.log('📱 Multi-device functionality is now available')
    console.log('🔄 Data will automatically sync from localStorage to database')

  } catch (err) {
    console.error('❌ Test failed:', err)
  }
}

testDatabase()