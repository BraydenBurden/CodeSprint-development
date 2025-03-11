ALTER TABLE users
ADD COLUMN verificationToken VARCHAR(255) AFTER verified,
ADD INDEX idx_verification_token (verificationToken); 