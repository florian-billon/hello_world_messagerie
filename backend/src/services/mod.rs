//! Business logic

pub mod auth;
pub mod channels;
pub mod jwt;
pub mod messages;
pub mod password;
pub mod servers;

// AUTH
pub use auth::{login, signup, logout, get_user_by_id};

// CHANNELS
pub use channels::{
    create_channel, delete_channel, get_channel, list_channels, update_channel,
};

// JWT
pub use jwt::{create_token, verify_token};

// MESSAGES
pub use messages::{create_message, delete_message, list_messages, update_message};

// PASSWORD
pub use password::{hash_password, verify_password};

// SERVERS
pub use servers::{
    create_server,
    delete_server,
    get_member,
    get_server,
    join_server,
    leave_server,
    list_members,
    list_user_servers,
    update_server,
};
