import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

<<<<<<< HEAD
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

=======
>>>>>>> 5c3c512ca8bf45b2c8592ca72b6918bdc0301090
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);