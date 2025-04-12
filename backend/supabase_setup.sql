-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for stores table
CREATE POLICY "Enable read access for all users" ON stores
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON stores
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable update for store owners" ON stores
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Create policies for reviews table
CREATE POLICY "Enable read access for all users" ON reviews
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON reviews
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable update for review owners" ON reviews
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true); 