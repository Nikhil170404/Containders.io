import { db, doc, collection, setDoc, serverTimestamp } from '../firebase';

const NOTIFICATION_SOUNDS = {
  default: '/sounds/notification.mp3',
  success: '/sounds/success.mp3',
  warning: '/sounds/warning.mp3',
  error: '/sounds/error.mp3',
};

const NOTIFICATION_ICONS = {
  wallet: '/icons/wallet.png',
  tournament: '/icons/tournament.png',
  game: '/icons/game.png',
  user: '/icons/user.png',
  default: '/logo192.png',
};

class NotificationService {
  static audio = new Audio();

  static playSound(type = 'default') {
    try {
      this.audio.src = NOTIFICATION_SOUNDS[type] || NOTIFICATION_SOUNDS.default;
      this.audio.play();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  static async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static getNotificationOptions(type, message) {
    return {
      body: message,
      icon: NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default,
      badge: NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default,
      image: NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default,
      vibrate: [200, 100, 200], // Vibration pattern
      timestamp: Date.now(),
      requireInteraction: true,
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
      silent: false, // We'll play our own sound
      renotify: true, // Show each notification separately
      tag: type, // Group similar notifications
    };
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

      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        // Play sound
        this.playSound(soundType);

        // Create and show notification
        const notification = new Notification(title, this.getNotificationOptions(type, message));

        // Handle notification interactions
        notification.onclick = (event) => {
          event.preventDefault();
          if (event.action === 'view') {
            // Handle view action
            window.focus();
            // Navigate based on type
            switch (type) {
              case 'wallet':
                window.location.href = '/wallet';
                break;
              case 'tournament':
                window.location.href = '/tournaments';
                break;
              case 'game':
                window.location.href = '/game-center';
                break;
              case 'user':
                window.location.href = '/profile';
                break;
              default:
                window.location.href = '/';
            }
          }
          notification.close();
        };

        notification.onclose = () => {
          // Handle notification close
          console.log('Notification closed');
        };
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  static async sendWalletNotification(userId, type, amount, status) {
    const title = `💰 Wallet ${type} ${status}`;
    const message = `Your ${type} request for $${amount} has been ${status}. ${
      status === 'approved' ? '✅' : '❌'
    }`;
    return this.createNotification(
      userId, 
      title, 
      message, 
      'wallet',
      status === 'approved' ? 'success' : 'warning'
    );
  }

  static async sendTournamentNotification(userId, tournamentName, action) {
    const title = `🏆 Tournament Update`;
    const message = `Tournament "${tournamentName}" ${action}`;
    return this.createNotification(userId, title, message, 'tournament', 'default');
  }

  static async sendGameNotification(userId, gameName, action) {
    const title = `🎮 Game Update`;
    const message = `Game "${gameName}" ${action}`;
    return this.createNotification(userId, title, message, 'game', 'default');
  }

  static async sendUserNotification(userId, action) {
    const title = `👤 Account Update`;
    const message = `Your account has been ${action}`;
    return this.createNotification(userId, title, message, 'user', 'default');
  }
}

export default NotificationService;
