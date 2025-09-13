import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing Supabase environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test basic connection
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .limit(1);

    if (goalsError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: goalsError
      }, { status: 500 });
    }

    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(3);

    return NextResponse.json({
      success: true,
      connection: 'Working',
      goals: goals?.length || 0,
      users: users?.length || 0,
      usersError: usersError?.message || null,
      environment: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : null
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create test user
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpass123',
      options: {
        data: {
          name: 'Test User',
          full_name: 'Test User'
        }
      }
    });

    if (error) {
      return NextResponse.json({
        error: 'Signup failed',
        details: error
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        confirmed: !!data.user?.email_confirmed_at
      },
      message: 'Test user created successfully'
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error.message
    }, { status: 500 });
  }
}
