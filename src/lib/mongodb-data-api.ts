/**
 * MongoDB Data API client for serverless environments
 * This provides a more efficient way to connect to MongoDB from serverless functions
 */

const DATA_API_KEY = process.env.MONGODB_DATA_API_KEY;
const DATA_API_URL = process.env.MONGODB_DATA_API_URL;
const DATABASE = process.env.MONGODB_DATABASE || "next-auth-app-prod";

if (!DATA_API_KEY) {
  throw new Error("MONGODB_DATA_API_KEY is not defined");
}

if (!DATA_API_URL) {
  throw new Error("MONGODB_DATA_API_URL is not defined");
}

/**
 * Find documents in a collection
 */
export async function findDocuments(
  collection: string,
  filter = {},
  options = {}
) {
  const response = await fetch(`${DATA_API_URL}/action/find`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "api-key": DATA_API_KEY || "",
    }),
    body: JSON.stringify({
      dataSource: "Cluster0", // Your cluster name
      database: DATABASE,
      collection,
      filter,
      ...options,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`MongoDB Data API error: ${error.error}`);
  }

  const result = await response.json();
  return result.documents;
}

/**
 * Find a single document in a collection
 */
export async function findDocument(collection: string, filter = {}) {
  const response = await fetch(`${DATA_API_URL}/action/findOne`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "api-key": DATA_API_KEY || "",
    }),
    body: JSON.stringify({
      dataSource: "Cluster0", // Your cluster name
      database: DATABASE,
      collection,
      filter,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`MongoDB Data API error: ${error.error}`);
  }

  const result = await response.json();
  return result.document;
}

/**
 * Insert a document into a collection
 */
export async function insertDocument(collection: string, document: any) {
  const response = await fetch(`${DATA_API_URL}/action/insertOne`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "api-key": DATA_API_KEY || "",
    }),
    body: JSON.stringify({
      dataSource: "Cluster0", // Your cluster name
      database: DATABASE,
      collection,
      document,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`MongoDB Data API error: ${error.error}`);
  }

  const result = await response.json();
  return result.insertedId;
}

/**
 * Update a document in a collection
 */
export async function updateDocument(
  collection: string,
  filter: any,
  update: any
) {
  const response = await fetch(`${DATA_API_URL}/action/updateOne`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "api-key": DATA_API_KEY || "",
    }),
    body: JSON.stringify({
      dataSource: "Cluster0", // Your cluster name
      database: DATABASE,
      collection,
      filter,
      update,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`MongoDB Data API error: ${error.error}`);
  }

  const result = await response.json();
  return result.modifiedCount > 0;
}

/**
 * Delete a document from a collection
 */
export async function deleteDocument(collection: string, filter: any) {
  const response = await fetch(`${DATA_API_URL}/action/deleteOne`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "api-key": DATA_API_KEY || "",
    }),
    body: JSON.stringify({
      dataSource: "Cluster0", // Your cluster name
      database: DATABASE,
      collection,
      filter,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`MongoDB Data API error: ${error.error}`);
  }

  const result = await response.json();
  return result.deletedCount > 0;
}
