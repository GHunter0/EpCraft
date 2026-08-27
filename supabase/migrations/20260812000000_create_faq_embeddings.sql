-- Enable vector extension for RAG search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create FAQ Embeddings Table (Vector 3072 for Gemini embedding models)
CREATE TABLE IF NOT EXISTS public.faq_embeddings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  embedding VECTOR(3072),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for public read
ALTER TABLE public.faq_embeddings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to FAQ embeddings" ON public.faq_embeddings;
CREATE POLICY "Allow public read access to FAQ embeddings"
  ON public.faq_embeddings
  FOR SELECT
  TO public
  USING (true);

-- Match FAQs RPC function using vector cosine distance (<=>)
CREATE OR REPLACE FUNCTION match_faqs (
  query_embedding VECTOR(3072),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 4
)
RETURNS TABLE (
  id BIGINT,
  question TEXT,
  content TEXT,
  category VARCHAR(50),
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fe.id,
    fe.question,
    fe.content,
    fe.category,
    (1 - (fe.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.faq_embeddings fe
  WHERE (1 - (fe.embedding <=> query_embedding)) > match_threshold
  ORDER BY fe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
