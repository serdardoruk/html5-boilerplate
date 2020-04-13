
Tampermonkey®
by Jan Biniok
Omerta Plusv0.1.27
AUTHOR	OPDev Team <info@omertaplus.com>
DESCRIPTION	Omerta Plus 0.1 (Make things better ;))
SOURCE	http://omertaplus.com/include/op.user.js
UserScript re-installation
 	All script settings will be reset!
INSTALLED VERSION	v0.1.27
NOTE	A recheck of the GreaseMonkey/FF compatibility options may be required in order to run this script.
INCLUDE(S)	http://*.barafranca.com/*
 	https://*.barafranca.com/*
 	http://barafranca.com/*
 	https://barafranca.com/*
 	http://*.barafranca.nl/*
 	...!
EXCLUDE(S)	http://*/game-register.php*
 	https://*/game-register.php*
                if (prefs['notify_' + topic + '_sound']) {
                    playSound(topic);
                }
            }, timeout * 1000);
        }
    }
}
​
function SendNotification(title, text, tag, callbackUrl, beyondIcon) {
    var notification = new Notification(title, {
        dir: 'auto',
        lang: '',
        body: text,
        tag: tag,
        icon: beyondIcon
    });
    notification.onclick = function () {
        if (callbackUrl !== null) {
            unsafeWindow.omerta.GUI.container.loadPage(callbackUrl);
        }
        window.focus();
        notification.close();
    };
​
    // Automatically close notification
    var autoCloseSecs = parseInt(sets['autoCloseNotificationsSecs'] || 0, 10);
    if (autoCloseSecs > 0) {
        setTimeout(function() {
            notification.close();
            delete notificationsArray[tag];
        }, autoCloseSecs * 1000);
    }
​
    notificationsArray[tag] = notification;
}
​
function CheckServiceVariable() {
​
    var intervalId = setInterval(function() {
        var serviceData = unsafeWindow.omerta.services.account.data;
​
        if (serviceData.logout) {
            clearInterval(intervalId);
            return;
        }
​
        if (prefs['notify_health'] || prefs['notify_health_sound']) {
            var newHealth = parseFloat(serviceData.progressbars.health);
            var oldHealth = parseFloat(getV('serviceHealth', 0));
            if (oldHealth > 0 && (oldHealth > newHealth)) {
                var healthText = 'You lost ' + (oldHealth - newHealth) + ' health!';
                var healthTitle = 'Health (' + v + ')';
                if (prefs['notify_health']) {
                    SendNotification(healthTitle, healthText, 'health', './BeO/webroot/index.php?module=Bloodbank', assetUrl('/images/red-star.png'));
                }
                if (prefs['notify_health_sound']) {
                    playSound('health');
                }
            }
​
            setV('serviceHealth', newHealth);
        }
​
        // check for new messages if they want them
        if (serviceData.messages.inbox.length > 0 && (prefs['notify_messages'] || prefs['notify_messages_sound'])) {
            var lastMessage = parseInt(getV('lastMessage', 0), 10);
​
            var totalMessages = 0;
            $.each(serviceData.messages.inbox, function(i, val) {
                var id = parseInt(val.id, 10);
                if (lastMessage === id) {
                    return false;
                }
                totalMessages += 1;
            });
​
            if (totalMessages !== 0) {
                var msgId = parseInt(serviceData.messages.inbox[0].id, 10);
                var msgTitle = '';
                var msgText = '';
                var callbackUrl = './BeO/webroot/index.php?module=Mail&action=showMsg&iMsgId=';
​
                setV('lastMessage', msgId);
                if (totalMessages === 1) {
                    msgText = translations.message[gameLang] + serviceData.messages.inbox[0].msg.replace(/<br \/>/g, '');
                    msgTitle = translations.new_message_from[gameLang] + serviceData.messages.inbox[0].frm + ': ' + serviceData.messages.inbox[0].sbj + ' (' + v + ')';
                    callbackUrl = callbackUrl + msgId;
                } else {
                    msgText = translations.you_got_message[gameLang].replace('%totalMessages', totalMessages);
                    msgTitle = translations.new_messages[gameLang].replace('%v', v);
                    callbackUrl = './BeO/webroot/index.php?module=Mail&action=inbox';
                }
                if (prefs['notify_messages']) {
                    SendNotification(msgTitle, msgText, 'Mail', callbackUrl, assetUrl('/images/red-star.png'));
