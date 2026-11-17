-- Chay mot lan tren database MySQL hien tai truoc khi khoi dong backend
ALTER TABLE interviews
ADD COLUMN question_count INT NOT NULL DEFAULT 10;
