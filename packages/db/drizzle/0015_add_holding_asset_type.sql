-- finatalk_holding.asset_type was added to the Drizzle schema but no SQL
-- migration ever created it. Same drift family as 0014.
ALTER TABLE "finatalk_holding" ADD COLUMN IF NOT EXISTS "asset_type" text;
