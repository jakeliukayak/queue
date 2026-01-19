# Database Migration Guide

## Required Database Changes

To use the new name and phone number fields, you need to update your Supabase `tickets` table with the following SQL migration:

### Migration SQL

```sql
ALTER TABLE tickets 
ADD COLUMN name TEXT,
ADD COLUMN phone_number TEXT;
```

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase project at https://supabase.com
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the migration SQL above
5. Click **Run** to execute the query
6. Verify the columns were added by checking the **Table Editor**

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Create a new migration file
supabase migration new add_name_phone_fields

# Edit the generated file in supabase/migrations/ and add the SQL above

# Apply the migration
supabase db push
```

## Verification

After running the migration, verify the changes:

```sql
-- Check the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets';
```

You should see `name` and `phone_number` columns listed with type `text`.

## Testing

Once the migration is complete:

1. Test creating a new ticket with all three fields (name, phone, email)
2. Verify the admin dashboard displays all fields correctly
3. Confirm real-time updates work for the current ticket display
4. Test the refresh buttons on both user and admin pages

## Rollback (if needed)

If you need to rollback the changes:

```sql
ALTER TABLE tickets 
DROP COLUMN name,
DROP COLUMN phone_number;
```

**Note:** This will permanently delete any data stored in these columns.
