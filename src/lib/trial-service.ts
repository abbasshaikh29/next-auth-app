import { dbconnect } from './db';
import { User } from '@/models/User';
import { Community } from '@/models/Community';
import { TrialHistory } from '@/models/TrialHistory';
import { createNotification } from './notifications';
import { sendEmail } from './email';

export interface TrialEligibilityResult {
  eligible: boolean;
  reason?: string;
  existingTrial?: any;
}

export interface TrialActivationResult {
  success: boolean;
  trialEndDate?: Date;
  error?: string;
  trialHistory?: any;
}

/**
 * Check if a user is eligible for a trial
 */
export async function checkTrialEligibility(
  userId: string,
  trialType: "user" | "community",
  communityId?: string
): Promise<TrialEligibilityResult> {
  try {
    await dbconnect();

    // Check if user has already used a trial of this type
    const hasUsedTrial = await TrialHistory.hasUserUsedTrial(userId, trialType, communityId);
    
    if (hasUsedTrial) {
      return {
        eligible: false,
        reason: "User has already used a free trial for this service"
      };
    }

    // Check if there's an active trial
    const activeTrial = await TrialHistory.getActiveTrial(userId, trialType, communityId);
    
    if (activeTrial) {
      return {
        eligible: false,
        reason: "User already has an active trial",
        existingTrial: activeTrial
      };
    }

    // For community trials, check additional restrictions
    if (trialType === "community" && communityId) {
      const community = await Community.findById(communityId);
      
      if (!community) {
        return {
          eligible: false,
          reason: "Community not found"
        };
      }

      // Check if community admin is the requesting user
      if (community.admin.toString() !== userId) {
        return {
          eligible: false,
          reason: "Only community admin can activate trial"
        };
      }

      // Check if community already has active payment
      if (community.paymentStatus === 'paid') {
        return {
          eligible: false,
          reason: "Community already has active subscription"
        };
      }

      // Check if community has used trial before
      if (community.adminTrialInfo?.hasUsedTrial) {
        return {
          eligible: false,
          reason: "Community has already used its free trial"
        };
      }
    }

    return { eligible: true };
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return {
      eligible: false,
      reason: "Error checking trial eligibility"
    };
  }
}

/**
 * Activate a trial for a user
 */
export async function activateTrial(
  userId: string,
  trialType: "user" | "community",
  communityId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<TrialActivationResult> {
  try {
    await dbconnect();

    // First check eligibility
    const eligibility = await checkTrialEligibility(userId, trialType, communityId);
    
    if (!eligibility.eligible) {
      return {
        success: false,
        error: eligibility.reason
      };
    }

    // Calculate trial end date (14 days from now)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialStartDate.getDate() + 14);

    // Create trial history record
    const trialHistory = new TrialHistory({
      userId,
      communityId: communityId ? communityId : undefined,
      trialType,
      startDate: trialStartDate,
      endDate: trialEndDate,
      status: 'active',
      ipAddress,
      userAgent,
      metadata: {
        activatedAt: new Date(),
        source: 'billing_page'
      }
    });

    await trialHistory.save();

    // Update user record
    const user = await User.findById(userId);
    if (user) {
      if (!user.paymentSettings) {
        user.paymentSettings = {};
      }
      
      user.paymentSettings.trialHistory = {
        hasUsedTrial: true,
        trialStartDate,
        trialEndDate,
        trialUsedAt: new Date()
      };

      if (trialType === "user") {
        user.paymentSettings.subscriptionStatus = "trial";
        user.paymentSettings.subscriptionEndDate = trialEndDate;
        user.role = "admin";
      }

      await user.save();
    }

    // Update community record if it's a community trial
    if (trialType === "community" && communityId) {
      const community = await Community.findById(communityId);
      if (community) {
        community.adminTrialInfo = {
          activated: true,
          startDate: trialStartDate,
          endDate: trialEndDate,
          hasUsedTrial: true,
          trialUsedAt: new Date(),
          cancelled: false
        };
        community.paymentStatus = 'trial';
        community.subscriptionEndDate = trialEndDate;
        community.freeTrialActivated = true;
        community.suspended = false; // Ensure community is not suspended

        await community.save();
      }
    }

    // Send welcome notification
    await sendTrialWelcomeNotification(userId, trialType, trialEndDate, communityId);

    return {
      success: true,
      trialEndDate,
      trialHistory
    };
  } catch (error) {
    console.error('Error activating trial:', error);
    return {
      success: false,
      error: "Failed to activate trial"
    };
  }
}

/**
 * Send welcome notification for new trial
 */
async function sendTrialWelcomeNotification(
  userId: string,
  trialType: "user" | "community",
  trialEndDate: Date,
  communityId?: string
) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let communityName = '';
    let linkUrl = '/profile';

    if (trialType === "community" && communityId) {
      const community = await Community.findById(communityId);
      if (community) {
        communityName = community.name;
        linkUrl = `/billing/${community.slug}`;
      }
    }

    const title = trialType === "community" 
      ? `Trial Started for ${communityName}`
      : "Your Free Trial Has Started";

    const message = trialType === "community"
      ? `Your 14-day free trial for ${communityName} is now active. Trial expires on ${trialEndDate.toLocaleDateString()}.`
      : `Your 14-day free trial is now active. Trial expires on ${trialEndDate.toLocaleDateString()}.`;

    // Create in-app notification
    await createNotification({
      userId,
      title,
      message,
      type: 'trial_started',
      linkUrl,
      metadata: {
        trialType,
        communityId,
        trialEndDate: trialEndDate.toISOString()
      }
    });

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: title,
      text: message,
      html: `
        <h2>${title}</h2>
        <p>${message}</p>
        <p><strong>Important:</strong> This is a one-time trial. After expiration, you'll need to subscribe to continue using premium features.</p>
        <p>Manage your subscription: <a href="${process.env.NEXTAUTH_URL}${linkUrl}">Click here</a></p>
      `
    });
  } catch (error) {
    console.error('Error sending trial welcome notification:', error);
  }
}

/**
 * Check if a community/user trial is active
 */
export async function isTrialActive(
  userId: string,
  trialType: "user" | "community",
  communityId?: string
): Promise<boolean> {
  try {
    const activeTrial = await TrialHistory.getActiveTrial(userId, trialType, communityId);
    return !!activeTrial;
  } catch (error) {
    console.error('Error checking if trial is active:', error);
    return false;
  }
}
