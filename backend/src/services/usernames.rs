use sqlx::Error as SqlxError;

const MIN_USERNAME_LENGTH: usize = 1;
const MAX_USERNAME_LENGTH: usize = 32;
const USERNAME_UNIQUE_CONSTRAINT: &str = "uq_users_username_normalized";

pub fn normalize_username(raw: &str) -> String {
    raw.trim().to_string()
}

pub fn validate_username(raw: &str) -> Result<String, String> {
    let normalized = normalize_username(raw);
    let length = normalized.chars().count();

    if !(MIN_USERNAME_LENGTH..=MAX_USERNAME_LENGTH).contains(&length) {
        return Err(format!(
            "Username must be between {} and {} characters",
            MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH
        ));
    }

    Ok(normalized)
}

pub fn is_username_unique_violation(err: &SqlxError) -> bool {
    err.as_database_error()
        .and_then(|db_err| db_err.constraint())
        .is_some_and(|constraint| constraint == USERNAME_UNIQUE_CONSTRAINT)
}
