import { dbconnect } from './db';
import mongoose from 'mongoose';

// Define the notification schema if it doesn't exist
let Notification: mongoose.Model<any>;

try {
  // Try to get the existing model
  Notification = mongoose.model('Notification');
} catch (error) {
  // Model doesn't exist, create it
  const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    linkUrl: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  });

  Notification = mongoose.model('Notification', notificationSchema);
}

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates a new notification for a user
 */
export async function createNotification(data: NotificationData) {
  try {
    await dbconnect();
    
    const notification = new Notification({
      userId: new mongoose.Types.ObjectId(data.userId),
      title: data.title,
      message: data.message,
      type: data.type,
      linkUrl: data.linkUrl,
      metadata: data.metadata,
      isRead: false,
      createdAt: new Date()
    });
    
    await notification.save();
    
    console.log(`Created notification for user ${data.userId}: ${data.title}`);
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Gets unread notifications for a user
 */
export async function getUnreadNotifications(userId: string) {
  try {
    await dbconnect();
    
    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false
    }).sort({ createdAt: -1 }).lean();
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await dbconnect();
    
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: String(error) };
  }
}
