import { storage } from "./appwrite.js";
import { ID } from "node-appwrite";

export async function uploadGoogleAvatar(imageUrl) {
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const file = await storage.createFile(
    process.env.APPWRITE_BUCKET_ID,
    ID.unique(),
    buffer,
    "google-avatar.jpg"
  );

  return `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
}
