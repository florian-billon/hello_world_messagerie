//! Business logic

pub mod auth;
pub mod channels;
pub mod invites;
pub mod jwt;
pub mod messages;
pub mod password;
pub mod realtime;
pub mod servers;

pub use auth::{login, logout, signup};
pub use channels::{create_channel, delete_channel, get_channel, list_channels, update_channel};
pub use invites::{create_invite, join_server_with_code, list_invites};
pub use jwt::{create_token, verify_token};
pub use messages::{create_message, delete_message, list_messages, update_message};
pub use password::{hash_password, verify_password};
pub use servers::{
    create_server, delete_server, get_member, get_server, join_server, leave_server, list_members,
    list_user_servers, transfer_ownership, update_member_role, update_server,
};
