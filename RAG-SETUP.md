# Nova document RAG and web research

Flow: teacher uploads UTF-8 TXT/Markdown -> normalized text -> model review -> explicit teacher approval -> queued chunk/vector indexing -> scoped similarity retrieval -> draft -> citation/schema checks -> isolated code check when applicable -> model critique -> at most one revision -> answer with sources, or a withheld answer.

## Configuration on Render nova-api
Existing OPENROUTER_API_KEY and OPENROUTER_CHAT_MODEL remain unchanged.
For semantic embeddings, set OPENROUTER_EMBEDDING_MODEL to an embedding model ID supported by your OpenRouter account and OPENROUTER_FREE_ONLY=false. Chat and embedding models are separate; Nemotron is the chat model. Without an embedding model, the local keyword-vector fallback remains active and is reported in job results.
To enable web research set AI_WEB_ENABLED=true and OPENROUTER_FREE_ONLY=false. AI_WEB_DOMAINS defaults to docs.python.org,developer.mozilla.org; supply a comma-separated exact hostname allowlist for your curriculum. OpenRouter web search and embedding calls can be billed even with a free chat model. No paid requests were made during development.

## Teacher and student workflow
In teacher lesson authoring, choose the course, open Sources, upload TXT or Markdown (20-16000 characters), refresh status after worker review, preview the document, then approve for teachers only or also students. Approval queues index synchronization. Revocation removes its chunks. To edit a source, revoke it and upload the corrected document. PDF, DOCX, OCR and arbitrary URL crawling are not implemented.
Both teacher and student AI panels accept an optional public research topic. Only that explicitly entered topic is sent to the separate web-search request, never the private lesson or user history. Provider-returned HTTPS citation excerpts on allowed domains become temporary evidence; generated web summaries are not treated as source evidence. Search failure is reported and local retrieval continues. Web evidence is saved with the job but does not automatically enter the reusable approved corpus. A teacher can import reviewed text through Sources.
Teacher Apply Suggestion now inserts the actual assistant response as a draft note; preview, review and save/publish remain teacher actions. Follow-up questions and previous permitted conversation responses inform future answers; this is retrieval/context, not model training.

## Storage and verification limits
Additive tables nova_ai_chunks and nova_ai_visibility are created on startup. Embeddings are stored as JSON vectors in Neon PostgreSQL (SQLite locally) and ranked by exact cosine similarity in the worker. This is a bounded persistent vector store, NOT a pgvector ANN index: at most 30 recent approved sources per course are searched. Source content hashes and embedding model IDs control re-indexing. Indexes are replaced atomically after rechecking source approval. Do not treat it as a large-scale search engine.
Students only retrieve published lesson content and sources explicitly marked student-visible. Source and course authorization are rechecked before releasing completed results. The reviewer is the same configured model; agreement does not guarantee factual truth. Unsupported citations trigger revision; unverified code remains withheld without an isolated grader.

## Validation
2026-11-08: 24 tests passed, including document normalization/index revision/revocation, web annotation filtering, explicit cost opt-in, source isolation and queued index processing. TypeScript, combined build and all three portal builds passed. Provider responses were mocked; live Neon, OpenRouter web/embedding calls and browser visual inspection remain unverified. Main Liara edition is unchanged.
