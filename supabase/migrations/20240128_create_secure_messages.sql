-- Create secure_messages table
CREATE TABLE IF NOT EXISTS public.secure_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_secure_messages_sender_id ON public.secure_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_recipient_id ON public.secure_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_sent_at ON public.secure_messages(sent_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can see messages they sent or received
CREATE POLICY "Users can view their own messages" ON public.secure_messages
    FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can insert messages as sender
CREATE POLICY "Users can send messages" ON public.secure_messages
    FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can update their own sent messages (e.g., for read receipts)
CREATE POLICY "Recipients can mark messages as read" ON public.secure_messages
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_secure_messages_updated_at 
    BEFORE UPDATE ON public.secure_messages 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.secure_messages TO authenticated;
GRANT SELECT ON public.secure_messages TO anon;