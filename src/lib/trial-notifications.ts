import { Community } from '@/models/Community';
import { dbconnect } from './db';
import { sendEmail } from './email';
import { User } from '@/models/User';
import { createNotification } from './notifications';

// Days before expiration when we want to send notifications
const NOTIFICATION_DAYS = [7, 3, 1];

/**
 * Checks for communities with trials about to expire and sends notifications
 * Should be run daily via a cron job
 */
export async function checkTrialExpirations() {
  try {
    await dbconnect();
    
    // Get current date
    const now = new Date();
    
    // For each notification day threshold
    for (const daysLeft of NOTIFICATION_DAYS) {
      // Calculate the target date (trial end date that is exactly X days from now)
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + daysLeft);
      
      // Set time to beginning of day for target date
      targetDate.setHours(0, 0, 0, 0);
      
      // Set time to end of day for target date
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setHours(23, 59, 59, 999);
      
      console.log(`Checking for trials expiring in ${daysLeft} days (${targetDate.toISOString()} to ${targetDateEnd.toISOString()})`);
      
      // Find communities where:
      // 1. Trial is active (either through adminTrialInfo or freeTrialActivated)
      // 2. Trial end date is within the target date range
      const communities = await Community.find({
        $or: [
          // Check adminTrialInfo expiration
          {
            'adminTrialInfo.activated': true,
            'adminTrialInfo.endDate': {
              $gte: targetDate,
              $lte: targetDateEnd
            }
          },
          // Check subscriptionEndDate for free trial
          {
            freeTrialActivated: true,
            subscriptionEndDate: {
              $gte: targetDate,
              $lte: targetDateEnd
            }
          }
        ]
      }).lean();
      
      console.log(`Found ${communities.length} communities with trials expiring in ${daysLeft} days`);
      
      // Process each community
      for (const community of communities) {
        await sendTrialExpirationNotifications(community, daysLeft);
      }
    }
    
    return { success: true, message: `Processed trial expiration notifications` };
  } catch (error) {
    console.error('Error checking trial expirations:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sends notifications to a community admin about trial expiration
 */
async function sendTrialExpirationNotifications(community: any, daysLeft: number) {
  try {
    // Get the admin user
    const adminId = community.admin.toString();
    const admin = await User.findById(adminId);
    
    if (!admin) {
      console.error(`Admin user not found for community ${community.name} (${community._id})`);
      return;
    }
    
    const communityName = community.name;
    const communitySlug = community.slug;
    
    // Create notification in the app
    await createNotification({
      userId: adminId,
      title: `Trial Ending Soon`,
      message: `Your free trial for ${communityName} will expire in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Please upgrade to continue using all features.`,
      type: 'trial_expiration',
      linkUrl: `/billing/${communitySlug}`,
      metadata: {
        communityId: community._id.toString(),
        daysLeft
      }
    });
    
    // Send email notification
    await sendEmail({
      to: admin.email,
      subject: `[${communityName}] Your Trial Expires in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}`,
      text: `Your free trial for ${communityName} will expire in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Please upgrade to continue using all features.`,
      html: `
        <h2>Your Trial is Ending Soon</h2>
        <p>Your free trial for <strong>${communityName}</strong> will expire in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.</p>
        <p>To continue using all premium features, please upgrade your subscription.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/billing/${communitySlug}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Upgrade Now</a></p>
        <p>If you have any questions, please contact our support team.</p>
      `
    });
    
    console.log(`Sent trial expiration notification to admin of ${communityName} (${daysLeft} days left)`);
    
  } catch (error) {
    console.error(`Error sending trial expiration notification for community ${community._id}:`, error);
  }
}
