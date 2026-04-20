use bson::{doc, Binary};
use futures::TryStreamExt;
use mongodb::Database;
use uuid::Uuid;

use crate::models::DirectMessageItem;

const COLLECTION_NAME: &str = "direct_message_items";

#[derive(Clone)]
pub struct DirectMessageRepository {
    db: Database,
}

impl DirectMessageRepository {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    fn collection(&self) -> mongodb::Collection<DirectMessageItem> {
        self.db.collection(COLLECTION_NAME)
    }

    fn uuid_to_binary(uuid: Uuid) -> Binary {
        Binary {
            subtype: bson::spec::BinarySubtype::Generic,
            bytes: uuid.as_bytes().to_vec(),
        }
    }

    fn uuid_filter(field: &str, uuid: Uuid) -> bson::Document {
        doc! {
            "$or": [
                { field: Self::uuid_to_binary(uuid) },
                { field: uuid.to_string() },
            ]
        }
    }

    pub async fn create(&self, message: &DirectMessageItem) -> mongodb::error::Result<()> {
        self.collection().insert_one(message).await?;
        Ok(())
    }

    pub async fn list_by_dm(
        &self,
        dm_id: Uuid,
        limit: i64,
    ) -> mongodb::error::Result<Vec<DirectMessageItem>> {
        let filter = doc! {
            "$and": [
                Self::uuid_filter("dm_id", dm_id),
                { "deleted_at": null },
            ]
        };

        let options = mongodb::options::FindOptions::builder()
            .sort(doc! { "created_at": -1 })
            .limit(limit)
            .build();

        let cursor = self.collection().find(filter).with_options(options).await?;
        let mut messages: Vec<DirectMessageItem> = cursor.try_collect().await?;
        messages.reverse();
        Ok(messages)
    }
}
