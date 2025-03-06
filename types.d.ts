import { Connection } from "mongoose";

declare global {
  var mongoose: {
    conn: Connection | null;
    pormise: Promise<Connection> | null;
  };
}

export {};
