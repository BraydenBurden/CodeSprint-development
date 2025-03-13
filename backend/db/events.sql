CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'meeting',
    all_day BOOLEAN DEFAULT FALSE,
    background_color VARCHAR(50),
    text_color VARCHAR(50),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start ON events(start);
CREATE INDEX idx_events_end ON events(end); 