-- Connect to the devlinks database
\c devlinks

-- Create the users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    password TEXT NOT NULL
);

-- Create the links table
CREATE TABLE links (
    link_id SERIAL PRIMARY KEY,
    platform VARCHAR(50) CHECK (platform IN ('GitHub', 'LinkedIn', 'Facebook', 'YouTube', 'GitLab')) NOT NULL,
    link TEXT NOT NULL,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the otps table
CREATE TABLE otps (
    otp_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Optional: Add a check constraint to enforce expiration if needed
    CONSTRAINT otp_expiry CHECK (created_at >= NOW() - INTERVAL '5 minutes')
);


-- add two more colums to the users table 
ALTER TABLE users
ADD COLUMN reset_password_expires VARCHAR(255);

ALTER TABLE users
ADD COLUMN reset_password_token VARCHAR(255);


-- new command to create users table 
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,                -- Unique identifier for each user
    name VARCHAR(255) NOT NULL,                -- User's name
    email VARCHAR(255) UNIQUE NOT NULL,        -- User's email address
    profile_picture TEXT,                      -- URL or path to the user's profile picture
    password TEXT NOT NULL,                    -- Hashed password
    reset_password_expires VARCHAR(255),          -- Expiration time for password reset token
    reset_password_token VARCHAR(255)          -- Token for password reset
);



