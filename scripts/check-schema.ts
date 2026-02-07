
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking 'business_profiles' table schema...");

    // Try to insert a dummy row to see what columns error out, or just fetch one row
    const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .limit(1);

    if (error) {
        console.error("Error connecting to table:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Existing columns in returned row:", Object.keys(data[0]));
    } else {
        console.log("Table is empty, cannot infer columns from data.");
        // Fallback: try to select specific columns and see if it errors
        const { error: colError } = await supabase
            .from("business_profiles")
            .select("web_login_image, home_background_image")
            .limit(1);

        if (colError) {
            console.error("Verification failed: Columns 'web_login_image' or 'home_background_image' likely missing.");
            console.error(colError);
        } else {
            console.log("Columns 'web_login_image' and 'home_background_image' appear to exist.");
        }
    }
}

checkSchema();
