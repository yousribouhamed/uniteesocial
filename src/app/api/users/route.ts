import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper: Map a Supabase auth user to our UserProfile shape
const DEFAULT_DIRECTORY_FIELDS = [
  "Full Name",
  "Profile Picture",
  "Email",
  "Phone Number",
  "Socials",
  "Industry",
  "Company",
  "Role",
  "Nationality",
  "Country of Residence",
  "About me section",
];

function mapAuthUserToProfile(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  banned_until?: string | null;
}) {
  const meta = authUser.user_metadata || {};
  const directoryFields = Array.isArray(meta.directory_fields)
    ? (meta.directory_fields as string[])
    : DEFAULT_DIRECTORY_FIELDS;

  return {
    id: authUser.id,
    full_name: (meta.full_name as string) || null,
    avatar_url: (meta.avatar_url as string) || null,
    role: (meta.role as string) || "Member",
    status: (meta.status as string) || "Active",
    profile_status: (meta.profile_status as string) || "Verified",
    email: authUser.email || null,
    phone: (meta.phone as string) || null,
    gender: (meta.gender as string) || null,
    country: (meta.country as string) || null,
    nationality: (meta.nationality as string) || null,
    profile_visible: meta.profile_visible === undefined ? true : Boolean(meta.profile_visible),
    directory_fields: directoryFields,
    created_at: authUser.created_at || null,
  };
}

// GET /api/users — List all users (admin only)
export async function GET() {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Fetch all users from Supabase Auth Admin API
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const users = (data?.users || []).map(mapAuthUserToProfile);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users — Create a new user (admin only)
export async function POST(request: Request) {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      country,
      nationality,
      role,
    } = body;

    // Validate required fields
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: "First name, email, and password are required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const full_name = `${firstName} ${lastName}`.trim();

    // Create auth user via Supabase Admin API with all data in user_metadata
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          phone: phone || "",
          gender: gender || "",
          country: country || "",
          nationality: nationality || "",
          role: role || "Member",
          status: "Active",
          profile_status: "Verified",
        },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Return the created user in our standard format
    const newUser = mapAuthUserToProfile(authData.user);

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/users — Delete a user (admin only)
export async function DELETE(request: Request) {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Delete the auth user
    const { error: authError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users — Update a user (admin only)
export async function PATCH(request: Request) {
  try {
    // Verify the requesting user is authenticated
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      full_name,
      role,
      status,
      profile_status,
      phone,
      gender,
      country,
      nationality,
      profile_visible,
      directory_fields,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Build metadata update dynamically (only include provided fields)
    const metadataUpdate: Record<string, unknown> = {};
    if (full_name !== undefined) metadataUpdate.full_name = full_name;
    if (role !== undefined) metadataUpdate.role = role;
    if (status !== undefined) metadataUpdate.status = status;
    if (profile_status !== undefined) metadataUpdate.profile_status = profile_status;
    if (phone !== undefined) metadataUpdate.phone = phone;
    if (gender !== undefined) metadataUpdate.gender = gender;
    if (country !== undefined) metadataUpdate.country = country;
    if (nationality !== undefined) metadataUpdate.nationality = nationality;
    if (profile_visible !== undefined) metadataUpdate.profile_visible = Boolean(profile_visible);
    if (directory_fields !== undefined) metadataUpdate.directory_fields = directory_fields;

    // Update auth user metadata
    const { data, error } = await adminClient.auth.admin.updateUserById(id, {
      user_metadata: metadataUpdate,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const updatedUser = mapAuthUserToProfile(data.user);

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
