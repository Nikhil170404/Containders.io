import { db, doc, collection, setDoc, serverTimestamp, deleteDoc, updateDoc, getDocs } from '../firebase';

class NotificationService {
  static swRegistration = null;

  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return false;
    }

    try {
      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
        scope: '/',
        type: 'module',
        updateViaCache: 'none'
      });

      // Wait for the service worker to be activated
      await navigator.serviceWorker.ready;
      
      this.swRegistration = registration;
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  static async requestPermission() {
    try {
      // Register service worker first
      await this.registerServiceWorker();

      // Request notification permission
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async createNotification(userId, title, message, type, soundType = 'default') {
    try {
      // Create notification in database
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        recipientId: userId,
        title,
        message,
        type,
        read: false,
        createdAt: serverTimestamp(),
      });

      // Show browser notification if permission is granted and service worker is registered
      if (Notification.permission === 'granted' && this.swRegistration) {
        const options = {
          body: message,
          icon: `/icons/${type}.png`,
          badge: `/icons/${type}.png`,
          vibrate: [200, 100, 200],
          tag: type, // Group similar notifications
          renotify: true, // Show each notification separately even with same tag
          data: {
            type,
            url: this.getNotificationUrl(type),
            timestamp: Date.now(),
          },
          actions: [
            {
              action: 'view',
              title: 'View',
            },
            {
              action: 'close',
              title: 'Close',
            },
          ],
          // Add custom styling
          dir: 'auto',
          requireInteraction: true,
        };

        await this.swRegistration.showNotification(title, options);
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  static getNotificationUrl(type) {
    switch (type) {
      case 'wallet':
        return '/wallet';
      case 'tournament':
        return '/tournaments';
      case 'game':
        return '/game-center';
      case 'user':
        return '/profile';
      default:
        return '/';
    }
  }

  static async sendWalletNotification(userId, type, amount, status) {
    const title = `💰 Wallet ${type} ${status}`;
    const message = `Your ${type} request for $${amount} has been ${status}. ${
      status === 'approved' ? '✅' : '❌'
    }`;
    return this.createNotification(userId, title, message, 'wallet');
  }

  static async sendTournamentNotification(userId, tournamentName, action) {
    const title = `🏆 Tournament Update`;
    const message = `Tournament "${tournamentName}" ${action}`;
    return this.createNotification(userId, title, message, 'tournament');
  }

  static async sendGameNotification(userId, gameName, action) {
    const title = `🎮 Game Update`;
    const message = `Game "${gameName}" ${action}`;
    return this.createNotification(userId, title, message, 'game');
  }

  static async sendUserNotification(userId, action) {
    const title = `👤 Account Update`;
    const message = `Your account has been ${action}`;
    return this.createNotification(userId, title, message, 'user');
  }

  static async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  static async updateNotification(notificationId, updates) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating notification:', error);
      return false;
    }
  }

  static async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async sendAdminNotification(title, message, type = 'announcement', priority = 'normal') {
    try {
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const sendPromises = [];

      usersSnapshot.forEach((userDoc) => {
        const userId = userDoc.id;
        sendPromises.push(
          this.createNotification(
            userId,
            title,
            message,
            'admin',
            priority
          )
        );
      });

      await Promise.all(sendPromises);
      return true;
    } catch (error) {
      console.error('Error sending admin notifications:', error);
      return false;
    }
  }
}

export default NotificationService;
