-- Add dedicated event chat toggle and chat-to-event link

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS dedicated_chat_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS chats_event_id_unique_idx
ON public.chats(event_id)
WHERE event_id IS NOT NULL;
