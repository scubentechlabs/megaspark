import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'manager';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { email, password, fullName, phone, role }: CreateUserRequest = await req.json();

    console.log('Creating admin user:', { email, role });

    // Validate input
    if (!email || !password || !fullName || !role) {
      throw new Error('Missing required fields');
    }

    if (!['admin', 'manager'].includes(role)) {
      throw new Error('Invalid role');
    }

    // Create the user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    console.log('User created successfully:', newUser.user.id);

    // Create admin_users record
    const { error: adminUserError } = await supabase
      .from('admin_users')
      .insert({
        user_id: newUser.user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        created_by: user.id,
      });

    if (adminUserError) {
      console.error('Error creating admin_users record:', adminUserError);
      // Try to clean up the auth user
      await supabase.auth.admin.deleteUser(newUser.user.id);
      throw adminUserError;
    }

    // Assign role
    const { error: roleAssignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: role,
        created_by: user.id,
      });

    if (roleAssignError) {
      console.error('Error assigning role:', roleAssignError);
      // Clean up
      await supabase.from('admin_users').delete().eq('user_id', newUser.user.id);
      await supabase.auth.admin.deleteUser(newUser.user.id);
      throw roleAssignError;
    }

    console.log('Admin user created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in create-admin-user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
